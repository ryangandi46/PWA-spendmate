/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";

export class AIEngine {
  /**
   * Main pipeline — runs daily via cron
   */
  static async runPipeline() {
    const users = await prisma.user.findMany({ select: { id: true } });

    for (const user of users) {
      try {
        const insights = await this.analyzeUser(user.id);

        // Store insights
        for (const insight of insights) {
          await prisma.insight.create({
            data: {
              userId: user.id,
              type: insight.type,
              content: insight.content,
            },
          });
        }

        // Store analysis snapshot
        const healthScore = await this.calculateHealthScore(user.id);
        const projection = await this.project30Days(user.id);

        await prisma.aIAnalysis.create({
          data: {
            userId: user.id,
            analysisJson: {
              healthScore,
              projection,
              timestamp: new Date().toISOString(),
            },
          },
        });
      } catch (error) {
        console.error(`AI Engine error for user ${user.id}:`, error);
      }
    }
  }

  /**
   * Analyze a user's spending behavior
   */
  static async analyzeUser(userId: string) {
    const insights: { type: "behavior" | "weekly" | "monthly" | "projection"; content: string }[] = [];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "expense",
        transactionDate: { gte: thirtyDaysAgo },
      },
      include: { category: true },
    });

    if (transactions.length === 0) return insights;

    // 1. Late night spending (hour >= 21)
    const lateNightTx = transactions.filter((tx: any) => {
      const hour = tx.transactionDate.getHours();
      return hour >= 21;
    });
    if (lateNightTx.length >= 3) {
      const total = lateNightTx.reduce((sum: number, tx: any) => sum + tx.amount, 0);
      insights.push({
        type: "behavior",
        content: `Kamu sering berbelanja di malam hari (setelah jam 9 malam). Total pengeluaran malam: Rp ${total.toLocaleString("id-ID")}.`,
      });
    }

    // 2. Weekend spending
    const weekendTx = transactions.filter((tx: any) => {
      const day = tx.transactionDate.getDay();
      return day === 0 || day === 6;
    });
    const weekdayTx = transactions.filter((tx: any) => {
      const day = tx.transactionDate.getDay();
      return day >= 1 && day <= 5;
    });

    const weekendTotal = weekendTx.reduce((sum: number, tx: any) => sum + tx.amount, 0);
    const weekdayTotal = weekdayTx.reduce((sum: number, tx: any) => sum + tx.amount, 0);

    // Normalize by number of days
    const avgWeekend = weekendTotal / Math.max(1, 8); // ~4 weekends × 2 days
    const avgWeekday = weekdayTotal / Math.max(1, 22); // ~22 weekdays

    if (avgWeekend > avgWeekday * 1.5) {
      insights.push({
        type: "behavior",
        content: `Pengeluaran kamu di akhir pekan cenderung lebih tinggi dibanding hari kerja.`,
      });
    }

    // 3. Category dominance (> 40%)
    const totalSpend = transactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);
    const categoryTotals: Record<string, { name: string; total: number }> = {};

    for (const tx of transactions) {
      if (!categoryTotals[tx.categoryId]) {
        categoryTotals[tx.categoryId] = { name: tx.category.name, total: 0 };
      }
      categoryTotals[tx.categoryId].total += tx.amount;
    }

    for (const [, data] of Object.entries(categoryTotals)) {
      const percentage = (data.total / totalSpend) * 100;
      if (percentage > 40) {
        insights.push({
          type: "behavior",
          content: `Kategori "${data.name}" mendominasi pengeluaranmu (${Math.round(percentage)}% dari total).`,
        });
      }
    }

    // 4. Subscription detection (same amount, recurring >= 3)
    const amountCounts: Record<number, number> = {};
    for (const tx of transactions) {
      amountCounts[tx.amount] = (amountCounts[tx.amount] || 0) + 1;
    }

    for (const [amount, count] of Object.entries(amountCounts)) {
      if (count >= 3) {
        insights.push({
          type: "behavior",
          content: `Terdeteksi pengeluaran berulang sebesar Rp ${parseInt(amount).toLocaleString("id-ID")} (${count} kali dalam 30 hari). Mungkin ini langganan?`,
        });
      }
    }

    return insights;
  }

  /**
   * Financial health score (0-100)
   */
  static async calculateHealthScore(userId: string): Promise<number> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    // Monthly totals
    const monthlyResult = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        transactionDate: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const income = monthlyResult.find((r: any) => r.type === "income")?._sum.amount || 0;
    const expense = monthlyResult.find((r: any) => r.type === "expense")?._sum.amount || 0;

    // Budget adherence (50%)
    const budgets = await prisma.budget.findMany({ where: { userId } });
    let budgetScore = 100;
    if (budgets.length > 0) {
      const catSpending = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: { userId, type: "expense", transactionDate: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      });

      let totalAdherence = 0;
      for (const b of budgets) {
        const spent = catSpending.find((c: any) => c.categoryId === b.categoryId)?._sum.amount || 0;
        totalAdherence += Math.max(0, Math.min(100, (1 - spent / b.monthlyLimit) * 100));
      }
      budgetScore = totalAdherence / budgets.length;
    }

    // Savings ratio (30%)
    const savingsRatio = income > 0 ? ((income - expense) / income) * 100 : 0;
    const savingsScore = Math.max(0, Math.min(100, savingsRatio * 2));

    // Spending stability (20%)
    const lastMonth = month === 0 ? 11 : month - 1;
    const lastYear = month === 0 ? year - 1 : year;
    const lastStart = new Date(lastYear, lastMonth, 1);
    const lastEnd = new Date(lastYear, lastMonth + 1, 0, 23, 59, 59);

    const lastMonthResult = await prisma.transaction.groupBy({
      by: ["type"],
      where: { userId, transactionDate: { gte: lastStart, lte: lastEnd } },
      _sum: { amount: true },
    });
    const lastExpense = lastMonthResult.find((r: any) => r.type === "expense")?._sum.amount || 0;

    let stabilityScore = 100;
    if (lastExpense > 0) {
      const variance = Math.abs((expense - lastExpense) / lastExpense);
      stabilityScore = Math.max(0, 100 - variance * 100);
    }

    return Math.max(0, Math.min(100, Math.round(
      budgetScore * 0.5 + savingsScore * 0.3 + stabilityScore * 0.2
    )));
  }

  /**
   * 30-day balance projection using simple linear regression
   */
  static async project30Days(userId: string) {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const transactions = await prisma.transaction.findMany({
      where: { userId, transactionDate: { gte: ninetyDaysAgo } },
      orderBy: { transactionDate: "asc" },
    });

    if (transactions.length < 7) {
      return { projectedBalance: null, trend: "insufficient_data" };
    }

    // Daily net cash flow
    const dailyNet: Record<string, number> = {};
    for (const tx of transactions) {
      const key = tx.transactionDate.toISOString().split("T")[0];
      const value = tx.type === "income" ? tx.amount : -tx.amount;
      dailyNet[key] = (dailyNet[key] || 0) + value;
    }

    const days = Object.entries(dailyNet).sort(([a], [b]) => a.localeCompare(b));
    const n = days.length;

    // Simple linear regression: y = a + bx
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += days[i][1];
      sumXY += i * days[i][1];
      sumX2 += i * i;
    }

    const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const a = (sumY - b * sumX) / n;

    // Project 30 days forward

    // Current balance
    const allTimeTotals = await prisma.transaction.groupBy({
      by: ["type"],
      where: { userId },
      _sum: { amount: true },
    });

    const totalIncome = allTimeTotals.find((r: any) => r.type === "income")?._sum.amount || 0;
    const totalExpense = allTimeTotals.find((r: any) => r.type === "expense")?._sum.amount || 0;
    const currentBalance = totalIncome - totalExpense;

    // Sum projected daily nets for 30 days
    let projectedChange = 0;
    for (let i = 1; i <= 30; i++) {
        projectedChange += a + b * (n + i);
    }

    return {
      projectedBalance: currentBalance + projectedChange,
      dailyTrend: b > 0 ? "improving" : b < 0 ? "declining" : "stable",
      currentBalance,
    };
  }
}
