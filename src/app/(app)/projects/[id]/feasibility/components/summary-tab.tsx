"use client";

import { useMemo, useState } from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FeasibilityState, FeasibilitySummary, LineItemSection } from "@/lib/feasibility/types";
import { calculateGst } from "@/lib/feasibility/gst";
import { resolveLineItemAmount } from "@/lib/feasibility/calculations";
import { formatCurrency, formatPct } from "./currency-helpers";

/** RAG colour class based on value and thresholds */
function ragColor(value: number, amber: number, red: number): string {
  if (value >= red) return "text-red-600";
  if (value >= amber) return "text-amber-600";
  return "text-emerald-600";
}

interface SummaryTabProps {
  summary: FeasibilitySummary;
  state: FeasibilityState;
}

/** Compute per-section GST totals from actual line item GST statuses */
function computeSectionGst(state: FeasibilityState): Record<string, number> {
  const totalLandSize = state.landLots.reduce((s, l) => s + (l.land_size_m2 || 0), 0);
  const lotCount = state.landLots.length || 1;
  const totalRevenue = state.salesUnits.reduce((s, u) => s + (u.sale_price || 0), 0);
  const projectLengthMonths = state.scenario.project_length_months || 24;

  const ctx = {
    totalLandSize,
    lotCount,
    constructionTotal: 0,
    grvTotal: totalRevenue,
    projectCostsTotal: 0,
    projectLengthMonths,
  };

  const gstMap: Record<string, number> = {};

  for (const item of state.lineItems) {
    const amountExGst = resolveLineItemAmount(item, ctx);
    const gst = calculateGst(amountExGst, item.gst_status);
    const section = item.section as string;
    gstMap[section] = (gstMap[section] || 0) + gst;
  }

  // Land cost GST: depends on lot GST flags
  let landGst = 0;
  for (const lot of state.landLots) {
    if (lot.land_purchase_gst_included) {
      // GST already in price, compute the GST component
      landGst += Math.round((lot.purchase_price || 0) / 11);
    } else if (lot.entity_gst_registered && !lot.margin_scheme_applied) {
      // Standard GST on land
      landGst += Math.round((lot.purchase_price || 0) * 0.1);
    }
    // else: exempt or margin scheme — no GST to add
  }
  gstMap["land"] = landGst;

  return gstMap;
}

const costBreakdown = [
  { label: "Land Cost", color: "bg-red-500", key: "landCost" as const },
  { label: "Acquisition", color: "bg-rose-400", key: "acquisitionCosts" as const },
  { label: "Professional Fees", color: "bg-amber-500", key: "professionalFees" as const },
  { label: "Construction", color: "bg-orange-500", key: "constructionCosts" as const },
  { label: "Dev Fees", color: "bg-yellow-500", key: "devFees" as const },
  { label: "Land Holding", color: "bg-lime-500", key: "landHoldingCosts" as const },
  { label: "Contingency", color: "bg-teal-500", key: "contingencyCosts" as const },
  { label: "Marketing", color: "bg-violet-500", key: "marketingCosts" as const },
  { label: "Agent Fees", color: "bg-cyan-500", key: "agentFees" as const },
  { label: "Legal Fees", color: "bg-sky-500", key: "legalFees" as const },
  { label: "Rental Costs", color: "bg-pink-500", key: "rentalCosts" as const },
  { label: "Funding Costs", color: "bg-indigo-500", key: "totalFundingCosts" as const },
];

/** Map summary keys to line item sections for GST lookup */
const sectionGstKey: Record<string, string> = {
  landCost: "land",
  acquisitionCosts: "acquisition",
  professionalFees: "professional_fees",
  constructionCosts: "construction",
  devFees: "dev_fees",
  landHoldingCosts: "land_holding",
  contingencyCosts: "contingency",
  marketingCosts: "marketing",
  agentFees: "agent_fees",
  legalFees: "legal_fees",
  rentalCosts: "rental_costs",
};

export function SummaryTab({ summary, state }: SummaryTabProps) {
  const [showIncGst, setShowIncGst] = useState(false);

  const gstMap = useMemo(() => computeSectionGst(state), [state]);

  /** Add accurate per-section GST */
  const gv = (amount: number, summaryKey?: string) => {
    if (!showIncGst) return amount;
    if (summaryKey && sectionGstKey[summaryKey]) {
      const sectionKey = sectionGstKey[summaryKey];
      return amount + (gstMap[sectionKey] || 0);
    }
    // Fallback: sum all cost GST
    return amount + Object.values(gstMap).reduce((s, v) => s + v, 0);
  };

  const costEntries = costBreakdown
    .map((c) => ({
      ...c,
      value: summary[c.key],
      pct: summary.totalCosts > 0 ? (summary[c.key] / summary.totalCosts) * 100 : 0,
    }))
    .filter((c) => c.value > 0);

  const gstLabel = showIncGst ? " (Inc GST)" : " (Ex GST)";

  // Total costs inc GST = sum of each section + its GST
  const totalCostsIncGst = showIncGst
    ? summary.totalCosts + Object.values(gstMap).reduce((s, v) => s + v, 0)
    : summary.totalCosts;

  return (
    <div className="space-y-6">
      {/* GST Toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-md border">
          <Button
            variant={!showIncGst ? "default" : "ghost"}
            size="sm"
            className="rounded-r-none"
            onClick={() => setShowIncGst(false)}
          >
            Ex GST
          </Button>
          <Button
            variant={showIncGst ? "default" : "ghost"}
            size="sm"
            className="rounded-l-none"
            onClick={() => setShowIncGst(true)}
          >
            Inc GST
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue{gstLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(showIncGst ? summary.totalRevenue : summary.totalRevenueExGst)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Costs{gstLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalCostsIncGst)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${summary.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {formatCurrency(summary.profit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <TrendingUp className="size-4" />
              Profit on Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${summary.profitOnCost >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {formatPct(summary.profitOnCost)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* P&L Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">P&L Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Revenue section */}
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Revenue
              </h4>
              <div className="flex justify-between text-sm">
                <span>Gross Revenue (Inc GST)</span>
                <span className="font-medium">
                  {formatCurrency(summary.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Revenue Ex GST</span>
                <span className="font-medium">
                  {formatCurrency(summary.totalRevenueExGst)}
                </span>
              </div>
              {summary.rentalIncome > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Net Rental Income</span>
                  <span className="font-medium">
                    {formatCurrency(summary.netRentalIncome)}
                  </span>
                </div>
              )}
            </div>

            {/* Costs section */}
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Costs{gstLabel}
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Land Cost</span>
                  <span className="font-medium">
                    {formatCurrency(gv(summary.landCost, "landCost"))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Acquisition Costs</span>
                  <span className="font-medium">
                    {formatCurrency(gv(summary.acquisitionCosts, "acquisitionCosts"))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Professional Fees</span>
                  <span className="font-medium">
                    {formatCurrency(gv(summary.professionalFees, "professionalFees"))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Construction</span>
                  <span className="font-medium">
                    {formatCurrency(gv(summary.constructionCosts, "constructionCosts"))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Development Fees</span>
                  <span className="font-medium">
                    {formatCurrency(gv(summary.devFees, "devFees"))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Land Holding</span>
                  <span className="font-medium">
                    {formatCurrency(gv(summary.landHoldingCosts, "landHoldingCosts"))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Contingency</span>
                  <span className="font-medium">
                    {formatCurrency(gv(summary.contingencyCosts, "contingencyCosts"))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Marketing</span>
                  <span className="font-medium">
                    {formatCurrency(gv(summary.marketingCosts, "marketingCosts"))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Agent Fees</span>
                  <span className="font-medium">
                    {formatCurrency(gv(summary.agentFees, "agentFees"))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Legal Fees</span>
                  <span className="font-medium">
                    {formatCurrency(gv(summary.legalFees, "legalFees"))}
                  </span>
                </div>
                {summary.rentalCosts > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Rental Costs</span>
                    <span className="font-medium">
                      {formatCurrency(gv(summary.rentalCosts, "rentalCosts"))}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Funding Costs */}
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Funding Costs
              </h4>
              <div className="flex justify-between text-sm">
                <span>Debt Interest</span>
                <span className="font-medium">
                  {formatCurrency(summary.totalDebtInterest)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Other Funding Costs</span>
                <span className="font-medium">
                  {formatCurrency(
                    summary.facilityFees + summary.loanFees + summary.equityFees
                  )}
                </span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="border-t pt-3">
              <div className="flex justify-between text-base font-bold">
                <span>Net Profit</span>
                <span
                  className={
                    summary.profit >= 0 ? "text-emerald-600" : "text-red-600"
                  }
                >
                  {formatCurrency(summary.profit)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Indicators */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="size-4 text-lime-500" />
                Project Indicators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <h4 className="text-xs font-medium uppercase text-muted-foreground">
                Margins
              </h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profit Margin</span>
                <span className="font-medium">
                  {formatPct(summary.profitMargin)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Development Margin
                </span>
                <span className="font-medium">
                  {formatPct(summary.developmentMargin)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profit on Cost</span>
                <span className="font-medium">
                  {formatPct(summary.profitOnCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Profit on Project Cost
                </span>
                <span className="font-medium">
                  {formatPct(summary.profitOnProjectCost)}
                </span>
              </div>

              <div className="border-t pt-2">
                <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  Residual Land Value
                </h4>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">RLV (Breakeven)</span>
                <span className="font-medium">
                  {formatCurrency(summary.residualLandValue)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  RLV (at Target Margin)
                </span>
                <span className="font-medium">
                  {formatCurrency(summary.residualLandValueAtTarget)}
                </span>
              </div>

              <div className="border-t pt-2">
                <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  Leverage
                </h4>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Ordinary Equity
                </span>
                <span className="font-medium">
                  {formatPct(summary.ordinaryEquityLeveragePct)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Preferred Equity
                </span>
                <span className="font-medium">
                  {formatPct(summary.preferredEquityLeveragePct)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Debt</span>
                <span className={`font-medium ${ragColor(summary.debtLeveragePct, 65, 80)}`}>
                  {formatPct(summary.debtLeveragePct)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">LTC Ratio</span>
                <span className={`font-medium ${ragColor(summary.debtToCostRatio, 65, 75)}`}>
                  {formatPct(summary.debtToCostRatio)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">LVR</span>
                <span className={`font-medium ${ragColor(summary.debtToGrvRatio, 60, 70)}`}>
                  {formatPct(summary.debtToGrvRatio)}
                </span>
              </div>

              {summary.unitCount > 0 && (
                <>
                  <div className="border-t pt-2">
                    <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                      Per Unit
                    </h4>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium">
                      {formatCurrency(summary.revenuePerUnit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="font-medium">
                      {formatCurrency(summary.costPerUnit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Profit</span>
                    <span className="font-medium">
                      {formatCurrency(summary.profitPerUnit)}
                    </span>
                  </div>
                </>
              )}

              {summary.totalSaleableArea > 0 && (
                <>
                  <div className="border-t pt-2">
                    <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                      Per m2 / Per Lot
                    </h4>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Ave. Net Sales / m2
                    </span>
                    <span className="font-medium">
                      {formatCurrency(summary.aveNetSalesPerM2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Ave. Net Sales / Lot
                    </span>
                    <span className="font-medium">
                      {formatCurrency(summary.aveNetSalesPerLot)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Ave. Construction / m2
                    </span>
                    <span className="font-medium">
                      {formatCurrency(summary.aveConstructionPerM2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Ave. Construction / Lot
                    </span>
                    <span className="font-medium">
                      {formatCurrency(summary.aveConstructionPerLot)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Cost Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {costEntries.length > 0 ? (
                <>
                  <div className="flex h-8 w-full overflow-hidden rounded-md">
                    {costEntries.map((c) => (
                      <div
                        key={c.key}
                        className={`${c.color} transition-all`}
                        style={{ width: `${c.pct}%` }}
                        title={`${c.label}: ${formatCurrency(c.value)} (${c.pct.toFixed(1)}%)`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {costEntries.map((c) => (
                      <div
                        key={c.key}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className={`size-3 rounded-sm ${c.color}`} />
                        <span className="text-muted-foreground">
                          {c.label}
                        </span>
                        <span className="ml-auto font-medium">
                          {c.pct.toFixed(0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Enter costs to see breakdown
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
