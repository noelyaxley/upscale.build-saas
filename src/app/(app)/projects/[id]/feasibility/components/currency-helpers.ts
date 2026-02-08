/** Format cents as AUD currency string */
export function formatCurrency(cents: number): string {
  if (cents === 0) return "$0";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Convert cents (bigint storage) to display value (dollars string) */
export function centsToDisplay(cents: number | null): string {
  if (!cents) return "";
  return (cents / 100).toString();
}

/** Convert user input (dollars string) to cents for storage */
export function displayToCents(val: string): number {
  if (!val) return 0;
  return Math.round(parseFloat(val) * 100);
}

/** Format a percentage */
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format a number with commas */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-AU", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
