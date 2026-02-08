import type { GstStatus } from "./types";

const GST_RATE = 0.1; // 10% Australian GST

/** Normalize an amount to ex-GST based on its GST status */
export function normalizeToExGst(amount: number, gstStatus: GstStatus): number {
  if (gstStatus === "inclusive") {
    return Math.round(amount / (1 + GST_RATE));
  }
  return amount; // exclusive or exempt
}

/** Calculate the GST component for an ex-GST amount */
export function calculateGst(amountExGst: number, gstStatus: GstStatus): number {
  if (gstStatus === "exempt") return 0;
  return Math.round(amountExGst * GST_RATE);
}

/** Margin scheme GST: 1/11 of the margin (sale price - purchase price) */
export function marginSchemeGst(salePrice: number, purchasePrice: number): number {
  const margin = salePrice - purchasePrice;
  if (margin <= 0) return 0;
  return Math.round(margin / 11);
}
