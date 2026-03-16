import { prisma } from "@/lib/prisma";

export const defaultCategories = [
  // Expense Categories
  { name: "Makanan & Minuman", icon: "🍽️", color: "#f59e0b", type: "expense" },
  { name: "Transportasi", icon: "🚗", color: "#3b82f6", type: "expense" },
  { name: "Belanja", icon: "🛍️", color: "#ec4899", type: "expense" },
  { name: "Hiburan", icon: "🎬", color: "#8b5cf6", type: "expense" },
  { name: "Tagihan & Utilitas", icon: "📄", color: "#64748b", type: "expense" },
  { name: "Kesehatan", icon: "💊", color: "#10b981", type: "expense" },
  { name: "Pendidikan", icon: "📚", color: "#0ea5e9", type: "expense" },
  { name: "Donasi", icon: "🤲", color: "#14b8a6", type: "expense" },
  { name: "Lainnya", icon: "📝", color: "#94a3b8", type: "expense" },
  
  // Income Categories
  { name: "Gaji", icon: "💰", color: "#10b981", type: "income" },
  { name: "Freelance", icon: "💻", color: "#0ea5e9", type: "income" },
  { name: "Investasi", icon: "📈", color: "#8b5cf6", type: "income" },
  { name: "Hadiah", icon: "🎁", color: "#f59e0b", type: "income" },
  { name: "Lainnya", icon: "💵", color: "#64748b", type: "income" },
];

export async function createDefaultCategories(userId: string) {
  const existing = await prisma.category.count({
    where: { userId },
  });

  if (existing === 0) {
    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({
        userId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
      })),
    });
  }
}
