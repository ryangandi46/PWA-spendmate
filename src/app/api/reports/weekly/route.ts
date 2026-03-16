import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    // Get last 7 days
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        type: "expense",
        transactionDate: {
          gte: weekStart,
          lte: now,
        },
      },
      include: { category: true },
      orderBy: { transactionDate: "asc" },
    });

    // Spending per day
    const dailySpending: Record<string, number> = {};
    const categorySpending: Record<
      string,
      { name: string; icon: string; color: string; total: number }
    > = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const key = date.toISOString().split("T")[0];
      dailySpending[key] = 0;
    }

    for (const tx of transactions) {
      const key = tx.transactionDate.toISOString().split("T")[0];
      if (dailySpending[key] !== undefined) {
        dailySpending[key] += tx.amount;
      }

      if (!categorySpending[tx.categoryId]) {
        categorySpending[tx.categoryId] = {
          name: tx.category.name,
          icon: tx.category.icon,
          color: tx.category.color,
          total: 0,
        };
      }
      categorySpending[tx.categoryId].total += tx.amount;
    }

    // Peak spending day
    let peakDay = "";
    let peakAmount = 0;
    for (const [day, amount] of Object.entries(dailySpending)) {
      if (amount > peakAmount) {
        peakDay = day;
        peakAmount = amount;
      }
    }

    const dailyData = Object.entries(dailySpending).map(([date, amount]) => ({
      date,
      amount,
      dayName: new Date(date).toLocaleDateString("id-ID", {
        weekday: "short",
      }),
    }));

    const categoryData = Object.values(categorySpending).sort(
      (a, b) => b.total - a.total
    );

    return NextResponse.json({
      dailySpending: dailyData,
      categoryDistribution: categoryData,
      peakSpendingDay: {
        date: peakDay,
        amount: peakAmount,
        dayName: peakDay
          ? new Date(peakDay).toLocaleDateString("id-ID", {
              weekday: "long",
            })
          : "-",
      },
      totalWeeklySpending: transactions.reduce(
        (sum: number, tx: { amount: number }) => sum + tx.amount,
        0
      ),
    });
  } catch (error) {
    console.error("Weekly report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
