"use client";

import { TrendingUp, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FeasibilitySummary } from "@/lib/feasibility/types";
import { formatCurrency, formatPct } from "./currency-helpers";

/** RAG colour class based on value and thresholds */
function ragColor(value: number, amber: number, red: number): string {
  if (value >= red) return "text-red-600";
  if (value >= amber) return "text-amber-600";
  return "text-emerald-600";
}

interface SummaryTabProps {
  summary: FeasibilitySummary;
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
  { label: "Funding Costs", color: "bg-indigo-500", key: "totalFundingCosts" as const },
];

export function SummaryTab({ summary }: SummaryTabProps) {
  const costEntries = costBreakdown
    .map((c) => ({
      ...c,
      value: summary[c.key],
      pct: summary.totalCosts > 0 ? (summary[c.key] / summary.totalCosts) * 100 : 0,
    }))
    .filter((c) => c.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalCosts)}
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
                <span>Gross Revenue</span>
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
            </div>

            {/* Costs section */}
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Costs
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Land Cost</span>
                  <span className="font-medium">
                    {formatCurrency(summary.landCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Acquisition Costs</span>
                  <span className="font-medium">
                    {formatCurrency(summary.acquisitionCosts)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Professional Fees</span>
                  <span className="font-medium">
                    {formatCurrency(summary.professionalFees)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Construction</span>
                  <span className="font-medium">
                    {formatCurrency(summary.constructionCosts)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Development Fees</span>
                  <span className="font-medium">
                    {formatCurrency(summary.devFees)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Land Holding</span>
                  <span className="font-medium">
                    {formatCurrency(summary.landHoldingCosts)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Contingency</span>
                  <span className="font-medium">
                    {formatCurrency(summary.contingencyCosts)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Marketing</span>
                  <span className="font-medium">
                    {formatCurrency(summary.marketingCosts)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Agent Fees</span>
                  <span className="font-medium">
                    {formatCurrency(summary.agentFees)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Legal Fees</span>
                  <span className="font-medium">
                    {formatCurrency(summary.legalFees)}
                  </span>
                </div>
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
