export function formatTzs(amount: number): string {
  try {
    return new Intl.NumberFormat("sw-TZ", {
      style: "currency",
      currency: "TZS",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount)} TZS`;
  }
}
