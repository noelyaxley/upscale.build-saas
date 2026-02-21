"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FeasibilitySummary } from "@/lib/feasibility/types";
import { formatCurrency, formatPct } from "./currency-helpers";

interface ComparisonMetric {
  label: string;
  getValue: (s: FeasibilitySummary) => number;
  format: "currency" | "pct";
  higherIsBetter: boolean;
}

const METRICS: ComparisonMetric[] = [
  { label: "Revenue (Ex GST)", getValue: (s) => s.totalRevenueExGst, format: "currency", higherIsBetter: true },
  { label: "Total Costs", getValue: (s) => s.totalCosts, format: "currency", higherIsBetter: false },
  { label: "Profit", getValue: (s) => s.profit, format: "currency", higherIsBetter: true },
  { label: "Profit Margin", getValue: (s) => s.profitMargin, format: "pct", higherIsBetter: true },
  { label: "Dev Margin", getValue: (s) => s.developmentMargin, format: "pct", higherIsBetter: true },
  { label: "Profit on Cost", getValue: (s) => s.profitOnCost, format: "pct", higherIsBetter: true },
  { label: "Construction", getValue: (s) => s.constructionCosts, format: "currency", higherIsBetter: false },
  { label: "Land Cost", getValue: (s) => s.landCost, format: "currency", higherIsBetter: false },
  { label: "Funding Costs", getValue: (s) => s.totalFundingCosts, format: "currency", higherIsBetter: false },
  { label: "IRR", getValue: (s) => s.irr, format: "pct", higherIsBetter: true },
  { label: "NPV", getValue: (s) => s.npv, format: "currency", higherIsBetter: true },
  { label: "LTC Ratio", getValue: (s) => s.debtToCostRatio, format: "pct", higherIsBetter: false },
  { label: "LVR", getValue: (s) => s.debtToGrvRatio, format: "pct", higherIsBetter: false },
];

interface ScenarioComparisonProps {
  scenarioAName: string;
  scenarioBName: string;
  summaryA: FeasibilitySummary;
  summaryB: FeasibilitySummary;
}

export function ScenarioComparison({
  scenarioAName,
  scenarioBName,
  summaryA,
  summaryB,
}: ScenarioComparisonProps) {
  const rows = useMemo(
    () =>
      METRICS.map((m) => {
        const a = m.getValue(summaryA);
        const b = m.getValue(summaryB);
        const delta = b - a;
        const isBetter = m.higherIsBetter ? delta > 0 : delta < 0;
        return { ...m, a, b, delta, isBetter };
      }),
    [summaryA, summaryB]
  );

  const fmt = (value: number, format: "currency" | "pct") =>
    format === "currency" ? formatCurrency(value) : formatPct(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Scenario Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Metric</th>
                <th className="pb-2 pr-4 text-right font-medium">{scenarioAName}</th>
                <th className="pb-2 pr-4 text-right font-medium">{scenarioBName}</th>
                <th className="pb-2 text-right font-medium">Delta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border/50">
                  <td className="py-1.5 pr-4">{row.label}</td>
                  <td className="py-1.5 pr-4 text-right">{fmt(row.a, row.format)}</td>
                  <td className="py-1.5 pr-4 text-right">{fmt(row.b, row.format)}</td>
                  <td
                    className={`py-1.5 text-right font-medium ${row.delta === 0 ? "" : row.isBetter ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {row.delta >= 0 ? "+" : ""}
                    {fmt(row.delta, row.format)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
