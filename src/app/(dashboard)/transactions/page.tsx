"use client";

import { useAppStore } from "@/store/useAppStore";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import TransactionModal from "@/components/transactions/TransactionModal";
import Skeleton from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";

function TransactionsContent() {
  const searchParams = useSearchParams();
  const {
    transactions,
    setTransactions,
    isTransactionModalOpen,
    setTransactionModalOpen,
  } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [categories, setCategories] = useState<
    { id: string; name: string; icon: string; color: string }[]
  >([]);

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setTransactionModalOpen(true);
    }
  }, [searchParams, setTransactionModalOpen]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [txRes, catRes] = await Promise.all([
          fetch("/api/transactions"),
          fetch("/api/categories"),
        ]);

        if (txRes.ok) {
          const data = await txRes.json();
          setTransactions(data.transactions);
        }

        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats);
        }
      } catch (error) {
        console.error("Fetch transactions/categories error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [setTransactions]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daftar Transaksi</h1>
          <p className="text-muted-foreground mt-1">Riwayat lengkap aktivitas keuanganmu</p>
        </div>
        <button
          onClick={() => setTransactionModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary-dark transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Filter */}
        <div className="flex gap-2 p-4 border-b border-border bg-secondary/30">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "expense" ? "bg-background shadow-sm text-expense" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "income" ? "bg-background shadow-sm text-income" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pemasukan
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="space-y-1 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Belum ada transaksi untuk filter ini.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-secondary/20 transition-colors">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: `${tx.category?.color}15` }}
                >
                  {tx.category?.icon || "🏷️"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {tx.note || tx.category?.name}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    {tx.category?.name}
                    <span className="w-1 h-1 rounded-full bg-border" />
                    {format(new Date(tx.transactionDate), "dd MMM yyyy", { locale: id })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`font-semibold ${
                      tx.type === "income" ? "text-income" : "text-expense"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setTransactionModalOpen(false)}
        categories={categories}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Memuat...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
