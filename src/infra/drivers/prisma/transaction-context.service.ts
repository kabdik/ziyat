import { AsyncLocalStorage } from 'async_hooks';

import { PrismaTransactionClient } from './prisma.interface';

type Context = {
  transaction: PrismaTransactionClient;
};

export class TransactionContextService {
  private static readonly cls = new AsyncLocalStorage<Context>();

  static getTransaction() {
    const context = this.getContext();

    return context?.transaction;
  }

  private static getContext(): Context | undefined {
    return this.cls.getStore();
  }

  static async runInContext<T>(tx: PrismaTransactionClient, handler: () => Promise<T>): Promise<T> {
    return this.cls.run({ transaction: tx }, handler);
  }
}
