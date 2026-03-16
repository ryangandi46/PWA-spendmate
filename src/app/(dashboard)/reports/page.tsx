"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Skeleton from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";

interface ReportData {
  totalWeeklySpending: number;
  dailySpending: Record<string, unknown>[];
  categoryDistribution: Record<string, unknown>[];
  peakSpendingDay: {
    dayName: string;
    amount: number;
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch("/api/reports/weekly");
        if (res.ok) {
          setReportData(await res.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl border border-border" />
          <Skeleton className="h-80 rounded-2xl border border-border" />
          <Skeleton className="col-span-full h-24 rounded-2xl border border-border" />
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-sm">
        <p className="text-danger font-medium">Gagal memuat laporan.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Laporan Mingguan</h1>
        <p className="text-muted-foreground mt-1">
          Analisis pengeluaran 7 hari terakhir ({formatCurrency(reportData.totalWeeklySpending)})
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spending Chart */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Pengeluaran Per Hari</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.dailySpending}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="dayName" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(val) => `Rp${val / 1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(val: unknown) => [
                    formatCurrency(val as number),
                    "Pengeluaran",
                  ]}
                  labelFormatter={(label) => `Hari: ${label}`}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Distribusi Kategori</h3>
          {reportData.categoryDistribution.length > 0 ? (
            <div className="h-72 w-full flex flex-col md:flex-row items-center">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="total"
                      stroke="none"
                    >
                      {reportData.categoryDistribution.map((entry, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: unknown) =>
                        formatCurrency(val as number)
                      }
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 min-w-0 md:pl-8 mt-4 md:mt-0 w-full">
                <div className="space-y-3">
                  {reportData.categoryDistribution.slice(0, 5).map((category, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate pr-4">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm truncate">{String(category.name)}</span>
                      </div>
                      <span className="text-sm font-medium shrink-0">
                        {Math.round((Number(category.total) / reportData.totalWeeklySpending) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-muted-foreground text-sm">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4 opacity-50">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
              Belum ada data pengeluaran minggu ini
            </div>
          )}
        </div>
        
        {/* Peak Spending Day Card */}
        <div className="col-span-1 lg:col-span-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Puncak Pengeluaran</h3>
            <p className="text-sm text-muted-foreground">Hari dengan pengeluaran terbesar minggu ini</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-foreground capitalize">
              {reportData.peakSpendingDay.dayName}
            </p>
            <p className="text-primary font-medium">
              {formatCurrency(reportData.peakSpendingDay.amount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
