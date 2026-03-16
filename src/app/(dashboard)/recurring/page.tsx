"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/utils";
import RecurringModal from "@/components/recurring/RecurringModal";

interface RecurringRule {
  id: string;
  categoryId: string;
  category: { name: string; icon: string; color: string };
  amount: number;
  type: "income" | "expense";
  frequency: "weekly" | "monthly" | "yearly";
  note: string | null;
  nextDueDate: string;
  isActive: boolean;
}

export default function RecurringPage() {
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, catsRes] = await Promise.all([
        fetch("/api/recurring"),
        fetch("/api/categories")
      ]);
      
      if (rulesRes.ok) setRules(await rulesRes.json());
      if (catsRes.ok) setCategories(await catsRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: "PATCH" });
      if (res.ok) {
        const updated = await res.json();
        setRules(rules.map(r => r.id === id ? updated : r));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Hapus rutinitas ini?")) return;
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRules(rules.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rutinitas Keuangan</h1>
          <p className="text-muted-foreground mt-1">Transaksi otomatis yang diulang secara berkala</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary-dark transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Setur Rutinitas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-44 rounded-2xl border border-border" />)
        ) : rules.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-card rounded-2xl border border-border border-dashed">
            Belum ada rutinitas yang diaktifkan.
          </div>
        ) : (
          rules.map((rule) => (
            <motion.div 
              key={rule.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-card rounded-2xl border border-border p-5 shadow-sm transition-opacity ${!rule.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${rule.category.color}15` }}
                  >
                    {rule.category.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{rule.note || rule.category.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">Setiap {rule.frequency === 'weekly' ? 'Minggu' : rule.frequency === 'monthly' ? 'Bulan' : 'Tahun'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleStatus(rule.id)}
                    className={`p-2 rounded-lg transition-colors ${rule.isActive ? 'text-success hover:bg-success-light' : 'text-muted-foreground hover:bg-secondary'}`}
                    title={rule.isActive ? "Nonaktifkan" : "Aktifkan"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {rule.isActive ? <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /> : <circle cx="12" cy="12" r="10" />}
                      <path d="M12 2v10" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 text-muted-foreground hover:text-danger hover:bg-danger-light rounded-lg transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Mendatang</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(rule.nextDueDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Jumlah</p>
                  <p className={`text-lg font-bold ${rule.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {rule.type === 'income' ? '+' : '-'} {formatCurrency(rule.amount)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <RecurringModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        onSuccess={fetchData}
      />
    </div>
  );
}
