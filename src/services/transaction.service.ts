import { prisma } from "@/lib/prisma";
import { CreateTransactionInput } from "@/schemas/transaction.schema";

export class TransactionService {
  static async create(userId: string, data: CreateTransactionInput) {
    return prisma.transaction.create({
      data: {
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        note: data.note || null,
        transactionDate: new Date(data.transactionDate),
      },
      include: {
        category: true,
      },
    });
  }

  static async getByUser(
    userId: string,
    options?: {
      month?: number;
      year?: number;
      type?: "income" | "expense";
      limit?: number;
      offset?: number;
    }
  ) {
    const where: Record<string, unknown> = { userId };

    if (options?.month !== undefined && options?.year !== undefined) {
      const startDate = new Date(options.year, options.month, 1);
      const endDate = new Date(options.year, options.month + 1, 0, 23, 59, 59);
      where.transactionDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (options?.type) {
      where.type = options.type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { transactionDate: "desc" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  }

  static async getMonthlyTotals(userId: string, year: number, month: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const results = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const income =
      results.find((r) => r.type === "income")?._sum.amount || 0;
    const expense =
      results.find((r) => r.type === "expense")?._sum.amount || 0;

    return { income, expense, balance: income - expense };
  }

  static async delete(userId: string, transactionId: string) {
    return prisma.transaction.deleteMany({
      where: { id: transactionId, userId },
    });
  }
}
