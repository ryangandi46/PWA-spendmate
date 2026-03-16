export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseRawValue(value: string): number {
  return Number(value.replace(/\D/g, ""));
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 17) return "Selamat Siang";
  if (hour < 21) return "Selamat Sore";
  return "Selamat Malam";
}

export function getHealthLabel(score: number) {
  if (score >= 80) return { text: "Sangat Baik", color: "text-success" };
  if (score >= 60) return { text: "Baik", color: "text-accent" };
  if (score >= 40) return { text: "Cukup", color: "text-warning" };
  return { text: "Perlu Perhatian", color: "text-danger" };
}
