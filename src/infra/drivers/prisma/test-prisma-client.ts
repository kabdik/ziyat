import { AsyncLocalStorage } from 'async_hooks';
import { randomBytes } from 'crypto';

import { Prisma, PrismaClient } from '@prisma/client';
import { isNil } from 'lodash';

import { PrismaTransactionClient } from './prisma.interface';
import { TransactionManager } from './transaction-manager';

const { JEST_WORKER_ID } = process.env;

if (!JEST_WORKER_ID) {
  throw new Error('Jest worker ID is not set');
}

const asyncLocalStorage = new AsyncLocalStorage<{ hasLock?: boolean }>();
const transactionManager = new TransactionManager();

class TransactionRolledBackError extends Error {
  message = 'Transaction rolled back';
}

export type FlatTransactionClient = Prisma.TransactionClient & {
  $commit: () => Promise<void>;
  $rollback: () => Promise<void>;
};

let transactionLock: Promise<void> | null = null;
/**
 * Acquires a lock for the worker. If the lock is already held, it waits until the lock is released.
 * @param {string} workerId - The ID of the worker to acquire the lock for.
 */
async function acquireLock(): Promise<() => void> {
  if (!isNil(transactionLock)) {
    await transactionLock;
  }

  let resolveLock: () => void;

  transactionLock = new Promise<void>((resolve) => {
    resolveLock = resolve;
  });

  return resolveLock; // Return the lock release function.
}

/**
 * Wraps a given asynchronous function within a database savepoint.
 * Ensures that only one instance runs at a time per worker thread.
 *
 * @param {Function} handler - The asynchronous function to be wrapped in the savepoint.
 * @returns The result of the async function if it succeeds.
 * @throws The error from the async function if it fails.
 */
async function wrapInSavepoint<T>(handler: () => Promise<T>): Promise<T> {
  const activeTransaction = getActiveTransaction();

  if (!activeTransaction) {
    throw new Error('No active transaction');
  }

  let releaseLock: () => void;

  if (!asyncLocalStorage.getStore()?.hasLock) {
    releaseLock = await acquireLock();
  }

  try {
    const savepointId = generateSavepointId();

    await createSavepoint(activeTransaction, savepointId);

    try {
      const result = await asyncLocalStorage.run({ hasLock: true }, handler);
      await releaseSavepoint(activeTransaction, savepointId);
      return result;
    } catch (error) {
      await rollbackToSavepoint(activeTransaction, savepointId);
      throw error;
    }
  } finally {
    releaseLock?.(); // Release the lock when the function completes or errors out.
  }
}

function generateSavepointId(): string {
  const savepointId = randomBytes(16).toString('hex');

  return `JEST_${JEST_WORKER_ID}_${savepointId}`;
}

async function createSavepoint(
  transaction: PrismaTransactionClient,
  savepointId: string,
): Promise<void> {
  await transaction.$executeRawUnsafe(`SAVEPOINT ${savepointId}`);
}

async function rollbackToSavepoint(
  transaction: PrismaTransactionClient,
  savepointId: string,
): Promise<void> {
  await transaction.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${savepointId}`);
}

async function releaseSavepoint(
  transaction: PrismaTransactionClient,
  savepointId: string,
): Promise<void> {
  await transaction.$executeRawUnsafe(`RELEASE SAVEPOINT ${savepointId}`);
}

function createExtendedPrismaClient(options?: Prisma.PrismaClientOptions) {
  const client = new PrismaClient(options);

  return client.$extends({
    client: {
      async $begin() {
        const { commit, rollback, transaction } = await startImperativeTransaction(client);
        // return a proxy TransactionClient with `$commit` and `$rollback` methods
        return new Proxy(transaction, {
          get(target, prop) {
            if (prop === '$commit') {
              return commit;
            }
            if (prop === '$rollback') {
              return rollback;
            }
            return target[prop as keyof typeof target];
          },
        }) as FlatTransactionClient;
      },
      async $transaction<T>(handler: () => Promise<T>) {
        return wrapInSavepoint(handler); // todo: fix
      },
    },
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          const transaction = getActiveTransaction();

          if (transaction) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            return transaction[model][operation](args);
          }

          return query(args);
        },
      },
    },
  });
}

export type IExtendedTestPrismaClient = new (
  options?: Prisma.PrismaClientOptions,
) => PrismaClient & {
  $transaction: <T>(handler: () => Promise<T>) => Promise<T>;
  $begin: () => Promise<FlatTransactionClient>;
};

export const ExtendedTestPrismaClient = class {
  constructor(options?: Prisma.PrismaClientOptions) {
    // eslint-disable-next-line no-constructor-return
    return createExtendedPrismaClient(options);
  }
} as IExtendedTestPrismaClient;

/**
 * Starts an imperative transaction with Prisma, ensuring only one active transaction per worker.
 * Provides methods to commit or rollback the transaction.
 *
 * @param {PrismaClient} prisma - The Prisma client instance to start the transaction.
 * @returns An object containing the transaction client and functions to commit or rollback the transaction.
 * @throws Will throw an error if a transaction is already active.
 */
async function startImperativeTransaction(prisma: PrismaClient) {
  ensureNoActiveTransaction();

  const {
    transactionClient,
    transactionCompletionPromise,
    rollbackTransaction,
    commitTransaction,
  } = await initiateTransactionClient(prisma);

  setActiveTransaction(transactionClient);

  return {
    transaction: transactionClient,
    commit: async () =>
      performTransactionAction(() => commitTransaction(), transactionCompletionPromise),
    rollback: async () =>
      performTransactionAction(() => rollbackTransaction(), transactionCompletionPromise),
  };
}

async function initiateTransactionClient(prisma: PrismaClient) {
  let setTransactionClient: (txClient: PrismaTransactionClient) => void;
  let commitTransaction: () => void;
  let rollbackTransaction: () => void;

  const transactionClientPromise = new Promise<Prisma.TransactionClient>((resolve) => {
    setTransactionClient = resolve;
  });

  const transactionControlPromise = new Promise<void>((resolve, reject) => {
    commitTransaction = resolve;
    rollbackTransaction = () => {
      reject(new TransactionRolledBackError());
    };
  });

  const transactionCompletionPromise = prisma
    .$transaction(async (txClient) => {
      setTransactionClient(txClient as unknown as PrismaTransactionClient);
      await transactionControlPromise; // Ensures that the transaction completes its commit or rollback operations
    })
    .catch(ignoreRollbackError); // ignore rollback error

  const transactionClient = await transactionClientPromise;

  return {
    transactionClient,
    transactionCompletionPromise,
    commitTransaction,
    rollbackTransaction,
  };
}

async function performTransactionAction(
  action: () => void,
  transactionCompletionPromise: Promise<void>,
) {
  action(); // Trigger commit or rollback
  await transactionCompletionPromise; // Ensure the transaction completes its operations
  resetActiveTransaction();
}

function ensureNoActiveTransaction() {
  if (getActiveTransaction()) {
    throw new Error(
      'Transaction already active. This client supports only one transaction at a time.',
    );
  }
}

function getActiveTransaction() {
  return transactionManager.getTransactionById(JEST_WORKER_ID);
}

function setActiveTransaction(transactionClient: PrismaTransactionClient) {
  return transactionManager.setTransaction(JEST_WORKER_ID, transactionClient);
}

function resetActiveTransaction() {
  return transactionManager.resetTransaction(JEST_WORKER_ID);
}

function ignoreRollbackError(error: unknown) {
  if (error instanceof TransactionRolledBackError) {
    return;
  }

  throw error;
}
