"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBudgetSchema, CreateBudgetInput } from "@/schemas/transaction.schema";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "@/components/ui/Skeleton";
import CurrencyInput from "@/components/ui/CurrencyInput";
import { formatCurrency } from "@/lib/utils";

interface Budget {
  id: string;
  categoryId: string;
  category: { name: string; icon: string; color: string };
  monthlyLimit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<CreateBudgetInput>({
    resolver: zodResolver(createBudgetSchema),
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [budgetsRes, catsRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/categories")
      ]);
      
      if (budgetsRes.ok) setBudgets(await budgetsRes.json());
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

  const onSubmit = async (data: CreateBudgetInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        await fetchData();
        reset();
        setIsModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budget Bulanan</h1>
          <p className="text-muted-foreground mt-1">Atur batasan pengeluaran per kategori</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary-dark transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Setujui Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-2xl border border-border" />)
        ) : budgets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
            Belum ada budget yang diatur. Klik tombol &quot;Setujui Budget&quot; untuk memulai.
          </div>
        ) : (
          budgets.map((budget) => {
            const isOverBudget = budget.percentageUsed > 100;
            const isWarning = budget.percentageUsed >= 80 && !isOverBudget;
            
            const progressColor = isOverBudget 
              ? "bg-danger" 
              : isWarning 
                ? "bg-warning" 
                : "bg-primary";
                
            return (
              <motion.div 
                key={budget.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card rounded-2xl border border-border p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${budget.category.color}15` }}
                    >
                      {budget.category.icon}
                    </div>
                    <span className="font-semibold text-foreground">{budget.category.name}</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(budget.spent)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      / {formatCurrency(budget.monthlyLimit)}
                    </span>
                  </span>
                </div>
                
                {/* Progress Bar Component embedded */}
                <div className="space-y-2">
                  <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, budget.percentageUsed)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${progressColor}`}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isOverBudget ? "text-danger font-medium" : "text-muted-foreground"}>
                      {budget.percentageUsed}% terpakai
                    </span>
                    <span className={isOverBudget ? "text-danger font-medium" : "text-success font-medium"}>
                      {isOverBudget ? "Over budget" : "Sisa "} 
                      {formatCurrency(Math.abs(budget.remaining))}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Modal Setup Budget */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-2xl p-6 z-50 shadow-xl border border-border"
            >
              <h2 className="text-lg font-semibold mb-6">Setur Budget Bulanan</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Kategori</label>
                  <select
                    {...register("categoryId")}
                    className="w-full px-4 py-3 bg-secondary rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="text-danger text-xs mt-1">{errors.categoryId.message}</p>}
                </div>
                <div>
                  <Controller
                    name="monthlyLimit"
                    control={control}
                    render={({ field }) => (
                      <CurrencyInput
                        label="Limit Bulanan"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.monthlyLimit?.message}
                        placeholder="0"
                      />
                    )}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary text-white rounded-xl font-medium mt-6 hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Budget"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
