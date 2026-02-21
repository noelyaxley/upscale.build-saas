"use client";

import { useMemo } from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  FeasibilityState,
  FeasibilityAction,
  FeasibilitySummary,
} from "@/lib/feasibility/types";
import { generateCashflow } from "@/lib/feasibility/cashflow";
import { calculateGst } from "@/lib/feasibility/gst";
import { formatCurrency } from "./currency-helpers";

interface FinancialsTabProps {
  state: FeasibilityState;
  dispatch: React.Dispatch<FeasibilityAction>;
  summary: FeasibilitySummary;
}

export function FinancialsTab({
  state,
  dispatch,
  summary,
}: FinancialsTabProps) {
  const cashflow = useMemo(() => generateCashflow(state), [state]);

  const startDate = state.scenario.start_date ?? "";
  const endDate = useMemo(() => {
    if (!startDate) return "";
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + (state.scenario.project_length_months || 24));
    return d.toISOString().split("T")[0];
  }, [startDate, state.scenario.project_length_months]);

  // GST summary
  const gstOnSales = state.salesUnits.reduce((sum, u) => {
    if (u.gst_status === "exempt") return sum;
    const exGst =
      u.gst_status === "inclusive"
        ? Math.round((u.sale_price || 0) / 1.1)
        : u.sale_price || 0;
    return sum + calculateGst(exGst, u.gst_status);
  }, 0);

  const gstOnCosts = state.lineItems.reduce((sum, item) => {
    if (item.gst_status === "exempt") return sum;
    return sum + calculateGst(item.amount_ex_gst || item.rate || 0, item.gst_status);
  }, 0);

  const netGst = gstOnSales - gstOnCosts;

  return (
    <div className="space-y-6">
      {/* Timeline Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="size-4 text-lime-500" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_SCENARIO",
                    payload: { start_date: e.target.value || null },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs">Project Length (months)</Label>
              <Input
                type="number"
                min={1}
                value={state.scenario.project_length_months}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_SCENARIO",
                    payload: {
                      project_length_months: parseInt(e.target.value) || 24,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs">End Date</Label>
              <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                {endDate || "-"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* P&L Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">P&L Report</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium">Revenue</td>
                <td className="py-2 text-right font-medium">
                  {formatCurrency(summary.totalRevenueExGst)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pl-4 text-muted-foreground">
                  Land Cost
                </td>
                <td className="py-1.5 text-right">
                  {formatCurrency(summary.landCost)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pl-4 text-muted-foreground">
                  Acquisition
                </td>
                <td className="py-1.5 text-right">
                  {formatCurrency(summary.acquisitionCosts)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pl-4 text-muted-foreground">
                  Professional Fees
                </td>
                <td className="py-1.5 text-right">
                  {formatCurrency(summary.professionalFees)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pl-4 text-muted-foreground">
                  Construction
                </td>
                <td className="py-1.5 text-right">
                  {formatCurrency(summary.constructionCosts)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pl-4 text-muted-foreground">
                  Dev Fees
                </td>
                <td className="py-1.5 text-right">
                  {formatCurrency(summary.devFees)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pl-4 text-muted-foreground">
                  Land Holding
                </td>
                <td className="py-1.5 text-right">
                  {formatCurrency(summary.landHoldingCosts)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pl-4 text-muted-foreground">
                  Contingency
                </td>
                <td className="py-1.5 text-right">
                  {formatCurrency(summary.contingencyCosts)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pl-4 text-muted-foreground">
                  Marketing
                </td>
                <td className="py-1.5 text-right">
                  {formatCurrency(summary.marketingCosts)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pl-4 text-muted-foreground">
                  Sales Costs
                </td>
                <td className="py-1.5 text-right">
                  {formatCurrency(summary.agentFees + summary.legalFees)}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Total Costs (ex Funding)</td>
                <td className="py-2 text-right font-medium text-red-600">
                  {formatCurrency(summary.totalCostsExFunding)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-1.5 pl-4 text-muted-foreground">
                  Funding Costs
                </td>
                <td className="py-1.5 text-right">
                  {formatCurrency(summary.totalFundingCosts)}
                </td>
              </tr>
              <tr className="border-t-2 border-foreground">
                <td className="py-2 text-base font-bold">Net Profit</td>
                <td
                  className={`py-2 text-right text-base font-bold ${summary.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {formatCurrency(summary.profit)}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Monthly Cashflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Cashflow</CardTitle>
        </CardHeader>
        <CardContent>
          {cashflow.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="sticky left-0 bg-background pb-2 pr-4 font-medium">
                      Category
                    </th>
                    {cashflow.map((m) => (
                      <th
                        key={m.month}
                        className="min-w-[80px] pb-2 pr-2 text-right font-medium"
                      >
                        {m.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="sticky left-0 bg-background py-1 pr-4 font-medium text-emerald-600">
                      Revenue
                    </td>
                    {cashflow.map((m) => (
                      <td key={m.month} className="py-1 pr-2 text-right">
                        {m.revenue > 0 ? formatCurrency(m.revenue) : "-"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="sticky left-0 bg-background py-1 pr-4">
                      Land
                    </td>
                    {cashflow.map((m) => (
                      <td key={m.month} className="py-1 pr-2 text-right">
                        {m.landCost > 0 ? formatCurrency(m.landCost) : "-"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="sticky left-0 bg-background py-1 pr-4">
                      Construction
                    </td>
                    {cashflow.map((m) => (
                      <td key={m.month} className="py-1 pr-2 text-right">
                        {m.constructionCosts > 0
                          ? formatCurrency(m.constructionCosts)
                          : "-"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="sticky left-0 bg-background py-1 pr-4">
                      Prof. Fees
                    </td>
                    {cashflow.map((m) => (
                      <td key={m.month} className="py-1 pr-2 text-right">
                        {m.professionalFees > 0
                          ? formatCurrency(m.professionalFees)
                          : "-"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="sticky left-0 bg-background py-1 pr-4">
                      Other Costs
                    </td>
                    {cashflow.map((m) => {
                      const other =
                        m.acquisitionCosts +
                        m.devFees +
                        m.landHoldingCosts +
                        m.contingencyCosts +
                        m.marketingCosts +
                        m.agentFees +
                        m.legalFees +
                        m.fundingCosts;
                      return (
                        <td key={m.month} className="py-1 pr-2 text-right">
                          {other > 0 ? formatCurrency(other) : "-"}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b font-medium">
                    <td className="sticky left-0 bg-background py-1.5 pr-4">
                      Net Cashflow
                    </td>
                    {cashflow.map((m) => (
                      <td
                        key={m.month}
                        className={`py-1.5 pr-2 text-right ${m.netCashflow >= 0 ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {formatCurrency(m.netCashflow)}
                      </td>
                    ))}
                  </tr>
                  <tr className="font-medium">
                    <td className="sticky left-0 bg-background py-1.5 pr-4">
                      Cumulative
                    </td>
                    {cashflow.map((m) => (
                      <td
                        key={m.month}
                        className={`py-1.5 pr-2 text-right ${m.cumulativeCashflow >= 0 ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {formatCurrency(m.cumulativeCashflow)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Set a start date and project length to generate cashflow
            </p>
          )}
        </CardContent>
      </Card>

      {/* GST Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">GST Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                GST Collected (Sales)
              </span>
              <span className="font-medium">{formatCurrency(gstOnSales)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                GST Paid (Input Tax Credits)
              </span>
              <span className="font-medium">{formatCurrency(gstOnCosts)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-sm font-medium">
              <span>Net GST Position</span>
              <span className={netGst >= 0 ? "text-red-600" : "text-emerald-600"}>
                {netGst >= 0 ? "Payable" : "Refund"}: {formatCurrency(Math.abs(netGst))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
