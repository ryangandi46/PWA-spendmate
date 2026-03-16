import { prisma } from "@/lib/prisma";
import { TransactionService } from "./transaction.service";
import { AIEngine } from "./ai-engine";

export class DashboardService {
  static async getDashboardData(userId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Parallel queries for performance
    const [
      monthlyTotals,
      recentTransactions,
      allTimeTotals,
      upcomingRecurring,
      insights,
      analysis,
    ] = await Promise.all([
      TransactionService.getMonthlyTotals(userId, year, month),
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { transactionDate: "desc" },
        take: 5,
      }),
      this.getAllTimeTotals(userId),
      prisma.recurringRule.findMany({
        where: {
          userId,
          isActive: true,
          nextDueDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        },
        include: { category: true },
        orderBy: { nextDueDate: "asc" },
        take: 5,
      }),
      prisma.insight.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.aIAnalysis.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // If no recent analysis, calculate on the fly for health score
    const healthScore = (analysis?.analysisJson as any)?.healthScore ?? 
                        await AIEngine.calculateHealthScore(userId);

    return {
      balance: allTimeTotals.balance,
      monthlyIncome: monthlyTotals.income,
      monthlyExpense: monthlyTotals.expense,
      financialHealthScore: healthScore,
      recentTransactions,
      upcomingRecurring,
      insights: insights.map((i: { content: string }) => i.content),
      projection: (analysis?.analysisJson as any)?.projection || null,
    };
  }

  static async getAllTimeTotals(userId: string) {
    const results = await prisma.transaction.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { amount: true },
    });

    const income =
      results.find((r: { type: string; _sum: { amount: number | null } }) => r.type === "income")?._sum.amount || 0;
    const expense =
      results.find((r: { type: string; _sum: { amount: number | null } }) => r.type === "expense")?._sum.amount || 0;

    return { income, expense, balance: income - expense };
  }


}
