import { Prisma, PrismaClient } from '@prisma/client';

import { TransactionContextService } from './transaction-context.service';

/**
 * This function creates a new transaction if there is none in the current context.
 * It will commit the transaction if it completes successfully, or abort if an error is encountered.
 * @param {PrismaClient} client - The PrismaClient instance.
 * @param {Function} handler - The function that will be performed within the transaction.
 * @return {Promise<T>} - The result of the transaction.
 */
async function performTransaction<T>(client: PrismaClient, handler: () => Promise<T>) {
  if (handlerAlreadyWrappedInTransaction()) {
    return handler();
  }

  return client.$transaction(async (tx) => TransactionContextService.runInContext(tx, handler));
}

function handlerAlreadyWrappedInTransaction() {
  return !!TransactionContextService.getTransaction();
}

function createExtendedPrismaClient(options?: Prisma.PrismaClientOptions) {
  const client = new PrismaClient(options);

  return client.$extends({
    client: {
      async $transaction<T>(handler: () => Promise<T>) {
        return performTransaction(client, handler);
      },
    },
    query: {
      $allModels: {
        $allOperations({ model, operation, args, query }) {
          const tx = TransactionContextService.getTransaction();

          if (tx) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            return tx[model][operation](args);
          }

          return query(args);
        },
      },
    },
  });
}

export type IExtendedPrismaClient = new (options?: Prisma.PrismaClientOptions) => PrismaClient & {
  $transaction: <T>(handler: () => Promise<T>) => Promise<T>;
};

export const ExtendedPrismaClient = class {
  constructor(options?: Prisma.PrismaClientOptions) {
    // eslint-disable-next-line no-constructor-return
    return createExtendedPrismaClient(options);
  }
} as IExtendedPrismaClient;
