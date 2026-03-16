import { prisma } from "@/lib/prisma";
import { CreateRecurringInput } from "@/schemas/transaction.schema";

export class RecurringService {
  static async create(userId: string, data: CreateRecurringInput) {
    return prisma.recurringRule.create({
      data: {
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        frequency: data.frequency,
        note: data.note || null,
        nextDueDate: new Date(data.nextDueDate),
      },
      include: { category: true },
    });
  }

  static async getByUser(userId: string) {
    return prisma.recurringRule.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { nextDueDate: "asc" },
    });
  }

  static async processRecurring() {
    const now = new Date();
    const dueRules = await prisma.recurringRule.findMany({
      where: {
        isActive: true,
        nextDueDate: { lte: now },
      },
    });

    for (const rule of dueRules) {
      // Create the transaction
      await prisma.transaction.create({
        data: {
          userId: rule.userId,
          categoryId: rule.categoryId,
          amount: rule.amount,
          type: rule.type,
          note: rule.note ? `[Recurring] ${rule.note}` : "[Recurring]",
          transactionDate: rule.nextDueDate,
        },
      });

      // Calculate next due date
      const nextDate = new Date(rule.nextDueDate);
      switch (rule.frequency) {
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case "yearly":
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      // Update the recurring rule
      await prisma.recurringRule.update({
        where: { id: rule.id },
        data: { nextDueDate: nextDate },
      });
    }

    return { processed: dueRules.length };
  }

  static async delete(userId: string, ruleId: string) {
    return prisma.recurringRule.deleteMany({
      where: { id: ruleId, userId },
    });
  }

  static async toggleActive(userId: string, ruleId: string) {
    const rule = await prisma.recurringRule.findFirst({
      where: { id: ruleId, userId },
    });

    if (!rule) return null;

    return prisma.recurringRule.update({
      where: { id: ruleId },
      data: { isActive: !rule.isActive },
      include: { category: true },
    });
  }
}
