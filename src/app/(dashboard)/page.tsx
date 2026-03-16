"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import Skeleton from "@/components/ui/Skeleton";
import { formatCurrency, getGreeting, getHealthLabel } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    dashboardData,
    isDashboardLoading,
    setDashboardData,
    setDashboardLoading,
  } = useAppStore();

  const [categories, setCategories] = useState<
    { id: string; name: string; icon: string; color: string }[]
  >([]);

  useEffect(() => {
    async function fetchDashboard() {
      setDashboardLoading(true);
      try {
        const [dashRes, catRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/categories"),
        ]);
        if (dashRes.ok) {
          const data = await dashRes.json();
          setDashboardData(data);
        }
        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setDashboardLoading(false);
      }
    }
    fetchDashboard();
  }, [setDashboardData, setDashboardLoading]);

  if (isDashboardLoading || !dashboardData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl border border-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-2xl border border-border" />
          <Skeleton className="h-48 rounded-2xl border border-border" />
        </div>
        <Skeleton className="h-64 rounded-2xl border border-border" />
      </div>
    );
  }

  const health = getHealthLabel(dashboardData.financialHealthScore);

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Greeting */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-foreground">
            {getGreeting()}, {session?.user?.name?.split(" ")[0] || "User"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Ini ringkasan keuanganmu hari ini
          </p>
        </motion.div>

        {/* Balance + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Balance */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-1 bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-primary-foreground"
          >
            <p className="text-sm opacity-80 mb-1">Saldo Saat Ini</p>
            <p className="text-3xl font-bold">
              {formatCurrency(dashboardData.balance)}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  dashboardData.financialHealthScore >= 60
                    ? "bg-green-300"
                    : "bg-amber-300"
                }`}
              />
              <span className="text-sm opacity-90">
                Skor Kesehatan: {dashboardData.financialHealthScore}/100
              </span>
            </div>
          </motion.div>

          {/* Monthly Income */}
          <motion.div
            variants={itemVariants}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">Pemasukan Bulan Ini</span>
            </div>
            <p className="text-2xl font-bold text-income">
              {formatCurrency(dashboardData.monthlyIncome)}
            </p>
          </motion.div>

          {/* Monthly Expense */}
          <motion.div
            variants={itemVariants}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-danger-light flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>
              <span className="text-sm text-muted-foreground">Pengeluaran Bulan Ini</span>
            </div>
            <p className="text-2xl font-bold text-expense">
              {formatCurrency(dashboardData.monthlyExpense)}
            </p>
          </motion.div>
        </div>

        {/* Health Score + AI Insight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Health Score */}
          <motion.div
            variants={itemVariants}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Skor Kesehatan Finansial
            </h3>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="currentColor"
                    className="text-secondary"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="currentColor"
                    className="text-primary"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${dashboardData.financialHealthScore * 2.64} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">
                    {dashboardData.financialHealthScore}
                  </span>
                </div>
              </div>
              <div>
                <p className={`text-lg font-semibold ${health.color}`}>
                  {health.text}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Berdasarkan kepatuhan budget, rasio tabungan, dan stabilitas pengeluaran
                </p>
              </div>
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            variants={itemVariants}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              💡 Insight Perilaku
            </h3>
            {dashboardData.insights && dashboardData.insights.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.insights.map((text: string, idx: number) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <p className="text-sm text-foreground leading-relaxed">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Belum ada insight. Mulai tambahkan transaksi untuk mendapatkan analisis perilaku finansialmu.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Projection Card */}
          <motion.div
            variants={itemVariants}
            className="bg-card rounded-2xl border border-border p-6 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              📈 Proyeksi Saldo 30 Hari
            </h3>
            {dashboardData.projection && dashboardData.projection.projectedBalance !== null ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Estimasi Saldo Mendatang</p>
                  <p className={`text-2xl font-bold ${dashboardData.projection.projectedBalance >= dashboardData.balance ? 'text-success' : 'text-danger'}`}>
                    {formatCurrency(dashboardData.projection.projectedBalance)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    dashboardData.projection.dailyTrend === 'improving' ? 'bg-success/10 text-success' : 
                    dashboardData.projection.dailyTrend === 'declining' ? 'bg-danger/10 text-danger' : 
                    'bg-secondary text-muted-foreground'
                  }`}>
                    Trend: {dashboardData.projection.dailyTrend === 'improving' ? 'Meningkat' : 
                            dashboardData.projection.dailyTrend === 'declining' ? 'Menurun' : 'Stabil'}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Berdasarkan pola pengeluaran 90 hari terakhir
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-sm text-muted-foreground">
                  Data belum cukup untuk membuat proyeksi. Terus catat transaksimu!
                </p>
              </div>
            )}
          </motion.div>

          {/* Tips / Call to Action or Quick Link */}
          <motion.div
            variants={itemVariants}
            className="bg-primary/5 rounded-2xl border border-primary/10 p-6 flex flex-col justify-center"
          >
            <h3 className="text-sm font-semibold text-primary mb-2">💡 Tips Hari Ini</h3>
            <p className="text-sm text-foreground/80 leading-relaxed mb-4">
              Tahukah kamu? Menetapkan budget per kategori dapat membantumu menghemat hingga 20% pengeluaran tak terduga.
            </p>
            <button 
              onClick={() => router.push("/budgets")}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Atur Budget Sekarang
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Recent Transactions + Quick Add */}
        <motion.div
          variants={itemVariants}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Transaksi Terakhir
            </h3>
            <button
              onClick={() => router.push("/transactions?add=true")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Tambah
            </button>
          </div>

          {dashboardData.recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                Belum ada transaksi. Klik tombol &quot;Tambah&quot; untuk memulai.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-2"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{
                      backgroundColor: `${tx.category?.color}15`,
                    }}
                  >
                    {tx.category?.icon || "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {tx.note || tx.category?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.transactionDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === "income" ? "text-income" : "text-expense"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Upcoming Recurring */}
        {dashboardData.upcomingRecurring &&
          dashboardData.upcomingRecurring.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-4">
                📅 Pembayaran Mendatang
              </h3>
              <div className="space-y-3">
                {dashboardData.upcomingRecurring.map(
                  (rule: Record<string, unknown>) => (
                    <div
                      key={rule.id as string}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                          style={{
                            backgroundColor: `${(rule.category as Record<string, string>)?.color}15`,
                          }}
                        >
                          {(rule.category as Record<string, string>)?.icon || "🔄"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {(rule.category as Record<string, string>)?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              rule.nextDueDate as string
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-expense">
                        {formatCurrency(rule.amount as number)}
                      </p>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}
      </motion.div>
    </>
  );
}
