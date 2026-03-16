import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z
    .number({ message: "Jumlah harus diisi" })
    .positive("Jumlah harus lebih dari 0"),
  type: z.enum(["income", "expense"], {
    message: "Tipe transaksi harus dipilih",
  }),
  categoryId: z
    .string({ message: "Kategori harus dipilih" })
    .uuid("Kategori tidak valid"),
  note: z.string().optional(),
  transactionDate: z.string({ message: "Tanggal harus diisi" }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const createBudgetSchema = z.object({
  categoryId: z
    .string({ message: "Kategori harus dipilih" })
    .uuid("Kategori tidak valid"),
  monthlyLimit: z
    .number({ message: "Limit bulanan harus diisi" })
    .positive("Limit harus lebih dari 0"),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const createRecurringSchema = z.object({
  categoryId: z
    .string({ message: "Kategori harus dipilih" })
    .uuid("Kategori tidak valid"),
  amount: z
    .number({ message: "Jumlah harus diisi" })
    .positive("Jumlah harus lebih dari 0"),
  type: z.enum(["income", "expense"]),
  frequency: z.enum(["weekly", "monthly", "yearly"], {
    message: "Frekuensi harus dipilih",
  }),
  note: z.string().optional(),
  nextDueDate: z.string({ message: "Tanggal berikutnya harus diisi" }),
});

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
