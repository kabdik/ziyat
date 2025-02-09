import { PrismaTransactionClient } from './prisma.interface';

export class TransactionManager {
  private transactionsById: Record<string, PrismaTransactionClient> = {};

  resetTransaction(id: string) {
    this.transactionsById[id] = null; // important to reset to null, since we can only check
  }

  setTransaction(id: string, newTransactionClient: PrismaTransactionClient) {
    this.transactionsById[id] = newTransactionClient;
  }

  getTransactionById(id: string) {
    return this.transactionsById[id] || null;
  }
}
