"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRecurringSchema, CreateRecurringInput } from "@/schemas/transaction.schema";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from "@/components/ui/Skeleton";
import CurrencyInput from "@/components/ui/CurrencyInput";

interface RecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string; icon: string; color: string }[];
  onSuccess: () => void;
}

export default function RecurringModal({
  isOpen,
  onClose,
  categories,
  onSuccess,
}: RecurringModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRecurringInput>({
    resolver: zodResolver(createRecurringSchema),
    defaultValues: {
      type: "expense",
      frequency: "monthly",
      nextDueDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: CreateRecurringInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        reset();
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Recurring submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-2xl p-6 z-50 shadow-xl border border-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Setur Transaksi Berulang</h2>
              <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    label="Jumlah"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.amount?.message}
                    placeholder="0"
                  />
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Tipe</label>
                  <select
                    {...register("type")}
                    className="w-full px-4 py-3 bg-secondary rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Frekuensi</label>
                  <select
                    {...register("frequency")}
                    className="w-full px-4 py-3 bg-secondary rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                    <option value="yearly">Tahunan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Kategori</label>
                <select
                  {...register("categoryId")}
                  className="w-full px-4 py-3 bg-secondary rounded-xl outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-danger text-xs mt-1">{errors.categoryId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Mulai Tanggal</label>
                <input
                  type="date"
                  {...register("nextDueDate")}
                  className="w-full px-4 py-3 bg-secondary rounded-xl outline-none focus:ring-2 focus:ring-primary"
                />
                {errors.nextDueDate && <p className="text-danger text-xs mt-1">{errors.nextDueDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Catatan (opsional)</label>
                <input
                  type="text"
                  {...register("note")}
                  placeholder="Contoh: Sewa Kos, Listrik, dll"
                  className="w-full px-4 py-3 bg-secondary rounded-xl outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium mt-4 hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Aktifkan Rutinitas"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
