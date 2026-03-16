import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Menjalankan seed database...");

  // Hanya seed admin user pertama jika tidak menggunakan auth dari luar
  // Atau default data jika diperlukan. Karena kita pakai NextAuth (Google), 
  // User akan dibuat on-the-fly. Tapi kita perlu Category template 
  // yang bisa kita copy ke setiap user baru, atau cukup sediakan seed
  // sebagai referensi ketika testing lokal.

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
