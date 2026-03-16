"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTransactionSchema,
  CreateTransactionInput,
} from "@/schemas/transaction.schema";
import { useAppStore } from "@/store/useAppStore";
import CurrencyInput from "@/components/ui/CurrencyInput";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string; icon: string; color: string }[];
}

export default function TransactionModal({
  isOpen,
  onClose,
  categories,
}: TransactionModalProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    addTransaction,
  } = useAppStore();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: "expense",
      transactionDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: CreateTransactionInput) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type }),
      });

      if (res.ok) {
        const transaction = await res.json();
        addTransaction(transaction);

        reset();
        onClose();
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md z-50"
          >
            <div className="bg-card rounded-2xl border border-border shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Tambah Transaksi
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Type Toggle */}
              <div className="flex gap-2 mb-6 bg-secondary rounded-xl p-1">
                <button
                  onClick={() => setType("expense")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    type === "expense"
                      ? "bg-expense text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pengeluaran
                </button>
                <button
                  onClick={() => setType("income")}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    type === "income"
                      ? "bg-income text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pemasukan
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Amount */}
                <div>
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
                        autoFocus
                      />
                    )}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Kategori
                  </label>
                  <select
                    {...register("categoryId")}
                    className="w-full px-4 py-3 bg-secondary rounded-xl border-0 text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-danger text-xs mt-1">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    {...register("transactionDate")}
                    className="w-full px-4 py-3 bg-secondary rounded-xl border-0 text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  {errors.transactionDate && (
                    <p className="text-danger text-xs mt-1">
                      {errors.transactionDate.message}
                    </p>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Catatan (opsional)
                  </label>
                  <input
                    type="text"
                    {...register("note")}
                    placeholder="Contoh: Makan siang, Grab, dll"
                    className="w-full px-4 py-3 bg-secondary rounded-xl border-0 text-foreground placeholder:text-muted outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
