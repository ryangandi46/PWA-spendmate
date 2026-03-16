import { prisma } from "@/lib/prisma";
import { CreateBudgetInput } from "@/schemas/transaction.schema";

export class BudgetService {
  static async upsert(userId: string, data: CreateBudgetInput) {
    return prisma.budget.upsert({
      where: {
        userId_categoryId: {
          userId,
          categoryId: data.categoryId,
        },
      },
      update: {
        monthlyLimit: data.monthlyLimit,
      },
      create: {
        userId,
        categoryId: data.categoryId,
        monthlyLimit: data.monthlyLimit,
      },
      include: { category: true },
    });
  }

  static async getByUser(userId: string) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    const categorySpending = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        type: "expense",
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    return budgets.map((budget) => {
      const spent =
        categorySpending.find((c) => c.categoryId === budget.categoryId)?._sum
          .amount || 0;
      const remaining = budget.monthlyLimit - spent;
      const percentageUsed =
        budget.monthlyLimit > 0
          ? Math.round((spent / budget.monthlyLimit) * 100)
          : 0;

      return {
        ...budget,
        spent,
        remaining,
        percentageUsed,
      };
    });
  }

  static async delete(userId: string, budgetId: string) {
    return prisma.budget.deleteMany({
      where: { id: budgetId, userId },
    });
  }
}
