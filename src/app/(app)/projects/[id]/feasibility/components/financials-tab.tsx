"use client";

import { useMemo } from "react";
import { Calendar, Landmark, Settings, TrendingUp, Users } from "lucide-react";
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
import { resolveAutoFacilitySize } from "@/lib/feasibility/calculations";
import { computeDrawdowns } from "@/lib/feasibility/drawdown";
import { formatCurrency } from "./currency-helpers";

interface FinancialsTabProps {
  state: FeasibilityState;
  dispatch: React.Dispatch<FeasibilityAction>;
  summary: FeasibilitySummary;
}

function PLRow({
  label,
  value,
  indent = false,
  bold = false,
  topBorder = false,
  color,
}: {
  label: string;
  value: number;
  indent?: boolean;
  bold?: boolean;
  topBorder?: boolean;
  color?: "green" | "red";
}) {
  const colorClass =
    color === "green"
      ? "text-emerald-600"
      : color === "red"
        ? "text-red-600"
        : color === undefined && bold
          ? value >= 0
            ? "text-emerald-600"
            : "text-red-600"
          : "";

  return (
    <tr className={topBorder ? "border-t-2 border-foreground" : "border-b border-border/50"}>
      <td
        className={`py-${bold ? "2" : "1.5"} ${indent ? "pl-4 text-muted-foreground" : ""} ${bold ? "font-medium" : ""}`}
      >
        {label}
      </td>
      <td
        className={`py-${bold ? "2" : "1.5"} text-right ${bold ? "font-medium" : ""} ${colorClass}`}
      >
        {formatCurrency(value)}
      </td>
    </tr>
  );
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

  // Profit distribution per equity partner
  const profitDistribution = useMemo(() => {
    const totalEquity = state.equityPartners.reduce(
      (sum, p) => sum + (p.equity_amount || 0),
      0
    );
    return state.equityPartners.map((p) => {
      const share = totalEquity > 0 ? (p.equity_amount || 0) / totalEquity : 0;
      const profitShare = Math.round(summary.profitAfterTax * share);
      const preferredReturn = Math.round(
        (p.equity_amount || 0) * (p.return_percentage || 0) / 100
      );
      const totalReturn = (p.equity_amount || 0) + preferredReturn + profitShare;
      const roi =
        p.equity_amount > 0
          ? ((totalReturn - p.equity_amount) / p.equity_amount) * 100
          : 0;
      return {
        name: p.name,
        equity: p.equity_amount,
        sharePct: share * 100,
        preferredReturn,
        profitShare,
        totalReturn,
        roi,
        isDeveloper: p.is_developer_equity,
      };
    });
  }, [state.equityPartners, summary.profitAfterTax]);

  // Drawdown schedule
  const drawdowns = useMemo(() => {
    if (state.debtFacilities.length === 0 || cashflow.length === 0) return [];

    const facilityCtx = {
      totalRevenueExGst: summary.totalRevenueExGst,
      totalRevenue: summary.totalRevenue,
      totalCostsExFunding: summary.totalCostsExFunding,
      constructionCosts: summary.constructionCosts,
      contingencyCosts: summary.contingencyCosts,
    };

    const resolved = state.debtFacilities.map((f) => ({
      id: f.id,
      name: f.name,
      size: resolveAutoFacilitySize(f, facilityCtx),
      interestRate: f.interest_rate,
      landLoanType: f.land_loan_type,
      priority: f.priority,
      sortOrder: f.sort_order,
    }));

    const monthlyCosts = cashflow.map(
      (m) =>
        m.landCost +
        m.acquisitionCosts +
        m.professionalFees +
        m.constructionCosts +
        m.devFees +
        m.landHoldingCosts +
        m.contingencyCosts +
        m.marketingCosts +
        m.agentFees +
        m.legalFees
    );

    return computeDrawdowns(
      resolved,
      monthlyCosts,
      cashflow.map((m) => m.label)
    );
  }, [state.debtFacilities, cashflow, summary]);

  return (
    <div className="space-y-6">
      {/* Timeline & Financial Settings */}
      <div className="grid gap-6 md:grid-cols-2">
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
                <Label className="text-xs">Length (months)</Label>
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="size-4 text-lime-500" />
              Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Tax Rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={state.scenario.tax_rate ?? 30}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_SCENARIO",
                      payload: {
                        tax_rate: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Discount Rate (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={state.scenario.discount_rate ?? 10}
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_SCENARIO",
                      payload: {
                        discount_rate: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* P&L Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profit & Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <tbody>
              {/* Revenue */}
              <PLRow label="Revenue (ex GST)" value={summary.totalRevenueExGst} bold color="green" />

              {/* Cost breakdown */}
              <PLRow label="Land Cost" value={summary.landCost} indent />
              <PLRow label="Acquisition" value={summary.acquisitionCosts} indent />
              <PLRow label="Professional Fees" value={summary.professionalFees} indent />
              <PLRow label="Construction" value={summary.constructionCosts} indent />
              <PLRow label="Dev Fees" value={summary.devFees} indent />
              <PLRow label="Land Holding" value={summary.landHoldingCosts} indent />
              <PLRow label="Contingency" value={summary.contingencyCosts} indent />
              <PLRow label="Marketing" value={summary.marketingCosts} indent />
              <PLRow label="Sales Costs" value={summary.agentFees + summary.legalFees} indent />
              <PLRow
                label="Total Project Costs"
                value={summary.totalCostsExFunding}
                bold
                color="red"
              />

              {/* EBIT */}
              <PLRow label="EBIT" value={summary.ebit} bold topBorder />

              {/* Funding costs breakdown */}
              <PLRow label="Facility Fees" value={summary.facilityFees} indent />
              <PLRow label="Loan Fees" value={summary.loanFees} indent />
              <PLRow label="Equity Fees" value={summary.equityFees} indent />
              <PLRow label="Debt Interest" value={summary.totalDebtInterest} indent />
              <PLRow
                label="Total Funding Costs"
                value={summary.totalFundingCosts}
                bold
                color="red"
              />

              {/* Profit Before Tax */}
              <PLRow label="Profit Before Tax" value={summary.profitBeforeTax} bold topBorder />

              {/* Tax */}
              <PLRow
                label={`Tax (${state.scenario.tax_rate ?? 30}%)`}
                value={summary.taxAmount}
                indent
                color="red"
              />

              {/* Profit After Tax */}
              <tr className="border-t-2 border-foreground">
                <td className="py-2 text-base font-bold">Profit After Tax</td>
                <td
                  className={`py-2 text-right text-base font-bold ${summary.profitAfterTax >= 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {formatCurrency(summary.profitAfterTax)}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* NPV / IRR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-lime-500" />
            Investment Returns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground">
                NPV (@ {state.scenario.discount_rate ?? 10}%)
              </p>
              <p
                className={`text-2xl font-bold ${summary.npv >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {formatCurrency(summary.npv)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">IRR</p>
              <p
                className={`text-2xl font-bold ${summary.irr >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {isFinite(summary.irr) ? `${summary.irr.toFixed(2)}%` : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profit Distribution */}
      {state.equityPartners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4 text-lime-500" />
              Profit Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Partner</th>
                    <th className="pb-2 pr-4 text-right font-medium">Equity</th>
                    <th className="pb-2 pr-4 text-right font-medium">Share %</th>
                    <th className="pb-2 pr-4 text-right font-medium">Pref. Return</th>
                    <th className="pb-2 pr-4 text-right font-medium">Profit Share</th>
                    <th className="pb-2 pr-4 text-right font-medium">Total Return</th>
                    <th className="pb-2 text-right font-medium">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {profitDistribution.map((p) => (
                    <tr key={p.name} className="border-b border-border/50">
                      <td className="py-1.5 pr-4">
                        {p.name}
                        {p.isDeveloper && (
                          <span className="ml-1.5 text-xs text-muted-foreground">(Dev)</span>
                        )}
                      </td>
                      <td className="py-1.5 pr-4 text-right">
                        {formatCurrency(p.equity)}
                      </td>
                      <td className="py-1.5 pr-4 text-right">
                        {p.sharePct.toFixed(1)}%
                      </td>
                      <td className="py-1.5 pr-4 text-right">
                        {formatCurrency(p.preferredReturn)}
                      </td>
                      <td className="py-1.5 pr-4 text-right">
                        {formatCurrency(p.profitShare)}
                      </td>
                      <td className="py-1.5 pr-4 text-right font-medium">
                        {formatCurrency(p.totalReturn)}
                      </td>
                      <td
                        className={`py-1.5 text-right font-medium ${p.roi >= 0 ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {p.roi.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drawdown Schedule */}
      {drawdowns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="size-4 text-lime-500" />
              Drawdown Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Facility</th>
                  <th className="pb-2 pr-4 text-right font-medium">Limit</th>
                  <th className="pb-2 pr-4 text-right font-medium">Peak Drawn</th>
                  <th className="pb-2 pr-4 text-right font-medium">Utilisation</th>
                  <th className="pb-2 pr-4 text-right font-medium">Interest</th>
                  <th className="pb-2 text-right font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {drawdowns.map((dd) => {
                  const util =
                    dd.facilitySize > 0
                      ? (dd.peakDrawn / dd.facilitySize) * 100
                      : 0;
                  return (
                    <tr key={dd.facilityId} className="border-b border-border/50">
                      <td className="py-1.5 pr-4">{dd.facilityName}</td>
                      <td className="py-1.5 pr-4 text-right">
                        {formatCurrency(dd.facilitySize)}
                      </td>
                      <td className="py-1.5 pr-4 text-right">
                        {formatCurrency(dd.peakDrawn)}
                      </td>
                      <td
                        className={`py-1.5 pr-4 text-right font-medium ${util > 90 ? "text-red-600" : util > 75 ? "text-amber-600" : "text-emerald-600"}`}
                      >
                        {util.toFixed(1)}%
                      </td>
                      <td className="py-1.5 pr-4 text-right">
                        {formatCurrency(dd.totalInterest)}
                      </td>
                      <td className="py-1.5 text-right text-xs text-muted-foreground">
                        {dd.landLoanType === "provisioned" ? "Provisioned" : "Serviced"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Month-by-month drawn balance */}
            <div className="overflow-x-auto">
              <table className="text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="sticky left-0 bg-background pb-2 pr-4 font-medium">
                      Facility
                    </th>
                    {drawdowns[0]?.months.map((m) => (
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
                  {drawdowns.map((dd) => (
                    <tr key={dd.facilityId} className="border-b border-border/50">
                      <td className="sticky left-0 bg-background py-1 pr-4">
                        {dd.facilityName}
                      </td>
                      {dd.months.map((m) => {
                        const util =
                          dd.facilitySize > 0
                            ? (m.cumulativeDrawn / dd.facilitySize) * 100
                            : 0;
                        return (
                          <td
                            key={m.month}
                            className={`py-1 pr-2 text-right ${util > 90 ? "text-red-600" : util > 75 ? "text-amber-600" : ""}`}
                          >
                            {m.cumulativeDrawn > 0
                              ? formatCurrency(m.cumulativeDrawn)
                              : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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
