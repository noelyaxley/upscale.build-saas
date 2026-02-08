"use client";

import { Plus, Trash2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FeasibilityState,
  FeasibilityAction,
  FeasibilitySummary,
  DebtFacility,
  DebtLoan,
  EquityPartner,
  LvrMethod,
  LoanType,
} from "@/lib/feasibility/types";
import {
  formatCurrency,
  centsToDisplay,
  displayToCents,
} from "./currency-helpers";

interface FundingTabProps {
  state: FeasibilityState;
  dispatch: React.Dispatch<FeasibilityAction>;
  summary: FeasibilitySummary;
}

export function FundingTab({ state, dispatch, summary }: FundingTabProps) {
  const totalDebt = state.debtFacilities.reduce(
    (s, f) => s + (f.total_facility || 0),
    0
  );
  const totalEquity = state.equityPartners.reduce(
    (s, e) => s + (e.equity_amount || 0),
    0
  );
  const totalFunding = totalDebt + totalEquity;
  const shortfall = Math.max(0, summary.totalCostsExFunding - totalFunding);

  const debtPct = totalFunding > 0 ? (totalDebt / totalFunding) * 100 : 0;
  const equityPct = totalFunding > 0 ? (totalEquity / totalFunding) * 100 : 0;

  const handleAddFacility = () => {
    const f: DebtFacility = {
      id: crypto.randomUUID(),
      scenario_id: state.scenario.id,
      name: `Facility ${state.debtFacilities.length + 1}`,
      priority: "senior",
      calculation_type: "manual",
      term_months: 24,
      lvr_method: "tdc",
      lvr_pct: 65,
      interest_rate: 0,
      total_facility: 0,
      interest_provision: 0,
      sort_order: state.debtFacilities.length,
    };
    dispatch({ type: "ADD_DEBT_FACILITY", payload: f });
  };

  const handleAddLoan = () => {
    const l: DebtLoan = {
      id: crypto.randomUUID(),
      scenario_id: state.scenario.id,
      name: `Loan ${state.debtLoans.length + 1}`,
      principal_amount: 0,
      interest_rate: 0,
      payment_period: "monthly",
      term_months: 12,
      loan_type: "interest_only",
      sort_order: state.debtLoans.length,
    };
    dispatch({ type: "ADD_DEBT_LOAN", payload: l });
  };

  const handleAddEquity = () => {
    const e: EquityPartner = {
      id: crypto.randomUUID(),
      scenario_id: state.scenario.id,
      name: `Partner ${state.equityPartners.length + 1}`,
      is_developer_equity: state.equityPartners.length === 0,
      distribution_type: "proportional",
      equity_amount: 0,
      return_percentage: 0,
      sort_order: state.equityPartners.length,
    };
    dispatch({ type: "ADD_EQUITY_PARTNER", payload: e });
  };

  return (
    <div className="space-y-6">
      {/* Funding Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Landmark className="size-4 text-lime-500" />
            Funding Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stacked bar */}
          <div className="flex h-8 w-full overflow-hidden rounded-md bg-muted">
            {totalDebt > 0 && (
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${debtPct}%` }}
                title={`Debt: ${formatCurrency(totalDebt)}`}
              />
            )}
            {totalEquity > 0 && (
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${equityPct}%` }}
                title={`Equity: ${formatCurrency(totalEquity)}`}
              />
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-sm bg-blue-500" />
              <span className="text-muted-foreground">Debt</span>
              <span className="font-medium">{formatCurrency(totalDebt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-sm bg-emerald-500" />
              <span className="text-muted-foreground">Equity</span>
              <span className="font-medium">{formatCurrency(totalEquity)}</span>
            </div>
            {shortfall > 0 && (
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-sm bg-red-500" />
                <span className="text-muted-foreground">Shortfall</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(shortfall)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* LVR Estimator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">LVR Estimator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">TDC (Total Dev Cost)</Label>
              <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                {formatCurrency(summary.totalCosts)}
              </div>
            </div>
            <div>
              <Label className="text-xs">GRV (Revenue)</Label>
              <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                {formatCurrency(summary.totalRevenue)}
              </div>
            </div>
            <div>
              <Label className="text-xs">Debt-to-Cost Ratio</Label>
              <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                {summary.totalCosts > 0
                  ? `${((totalDebt / summary.totalCosts) * 100).toFixed(1)}%`
                  : "-"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt Facilities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Debt Facilities</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddFacility}>
            <Plus className="mr-1 size-3.5" />
            Add Facility
          </Button>
        </CardHeader>
        <CardContent>
          {state.debtFacilities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-2 font-medium">Name</th>
                    <th className="w-24 pb-2 pr-2 font-medium">Priority</th>
                    <th className="w-24 pb-2 pr-2 font-medium">LVR Method</th>
                    <th className="w-20 pb-2 pr-2 font-medium">LVR %</th>
                    <th className="w-20 pb-2 pr-2 font-medium">Rate %</th>
                    <th className="w-20 pb-2 pr-2 font-medium">Term (m)</th>
                    <th className="w-28 pb-2 pr-2 font-medium">Facility</th>
                    <th className="w-28 pb-2 pr-2 font-medium">Interest</th>
                    <th className="w-10 pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {state.debtFacilities.map((f) => (
                    <tr key={f.id} className="border-b border-border/50">
                      <td className="py-1 pr-2">
                        <Input
                          value={f.name}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_DEBT_FACILITY",
                              payload: {
                                id: f.id,
                                changes: { name: e.target.value },
                              },
                            })
                          }
                          className="h-8 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Select
                          value={f.priority}
                          onValueChange={(v) =>
                            dispatch({
                              type: "UPDATE_DEBT_FACILITY",
                              payload: {
                                id: f.id,
                                changes: { priority: v },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 border-none bg-transparent shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="mezzanine">Mezzanine</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-1 pr-2">
                        <Select
                          value={f.lvr_method}
                          onValueChange={(v) =>
                            dispatch({
                              type: "UPDATE_DEBT_FACILITY",
                              payload: {
                                id: f.id,
                                changes: { lvr_method: v as LvrMethod },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 border-none bg-transparent shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tdc">TDC</SelectItem>
                            <SelectItem value="grv">GRV</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          step="0.1"
                          min={0}
                          max={100}
                          value={f.lvr_pct}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_DEBT_FACILITY",
                              payload: {
                                id: f.id,
                                changes: {
                                  lvr_pct: parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="h-8 w-20 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={f.interest_rate}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_DEBT_FACILITY",
                              payload: {
                                id: f.id,
                                changes: {
                                  interest_rate:
                                    parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="h-8 w-20 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          min={1}
                          value={f.term_months}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_DEBT_FACILITY",
                              payload: {
                                id: f.id,
                                changes: {
                                  term_months: parseInt(e.target.value) || 24,
                                },
                              },
                            })
                          }
                          className="h-8 w-20 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          step="1"
                          min={0}
                          value={centsToDisplay(f.total_facility)}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_DEBT_FACILITY",
                              payload: {
                                id: f.id,
                                changes: {
                                  total_facility: displayToCents(e.target.value),
                                },
                              },
                            })
                          }
                          className="h-8 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          step="1"
                          min={0}
                          value={centsToDisplay(f.interest_provision)}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_DEBT_FACILITY",
                              payload: {
                                id: f.id,
                                changes: {
                                  interest_provision: displayToCents(
                                    e.target.value
                                  ),
                                },
                              },
                            })
                          }
                          className="h-8 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() =>
                            dispatch({
                              type: "REMOVE_DEBT_FACILITY",
                              payload: f.id,
                            })
                          }
                        >
                          <Trash2 className="size-3.5 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No debt facilities added
            </p>
          )}
        </CardContent>
      </Card>

      {/* Debt Loans */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Debt Loans</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddLoan}>
            <Plus className="mr-1 size-3.5" />
            Add Loan
          </Button>
        </CardHeader>
        <CardContent>
          {state.debtLoans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-2 font-medium">Name</th>
                    <th className="w-28 pb-2 pr-2 font-medium">Principal</th>
                    <th className="w-20 pb-2 pr-2 font-medium">Rate %</th>
                    <th className="w-24 pb-2 pr-2 font-medium">Period</th>
                    <th className="w-20 pb-2 pr-2 font-medium">Term (m)</th>
                    <th className="w-28 pb-2 pr-2 font-medium">Type</th>
                    <th className="w-10 pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {state.debtLoans.map((l) => (
                    <tr key={l.id} className="border-b border-border/50">
                      <td className="py-1 pr-2">
                        <Input
                          value={l.name}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_DEBT_LOAN",
                              payload: {
                                id: l.id,
                                changes: { name: e.target.value },
                              },
                            })
                          }
                          className="h-8 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          step="1"
                          min={0}
                          value={centsToDisplay(l.principal_amount)}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_DEBT_LOAN",
                              payload: {
                                id: l.id,
                                changes: {
                                  principal_amount: displayToCents(
                                    e.target.value
                                  ),
                                },
                              },
                            })
                          }
                          className="h-8 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          value={l.interest_rate}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_DEBT_LOAN",
                              payload: {
                                id: l.id,
                                changes: {
                                  interest_rate:
                                    parseFloat(e.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="h-8 w-20 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Select
                          value={l.payment_period}
                          onValueChange={(v) =>
                            dispatch({
                              type: "UPDATE_DEBT_LOAN",
                              payload: {
                                id: l.id,
                                changes: { payment_period: v },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 border-none bg-transparent shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          min={1}
                          value={l.term_months}
                          onChange={(e) =>
                            dispatch({
                              type: "UPDATE_DEBT_LOAN",
                              payload: {
                                id: l.id,
                                changes: {
                                  term_months: parseInt(e.target.value) || 12,
                                },
                              },
                            })
                          }
                          className="h-8 w-20 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Select
                          value={l.loan_type}
                          onValueChange={(v) =>
                            dispatch({
                              type: "UPDATE_DEBT_LOAN",
                              payload: {
                                id: l.id,
                                changes: { loan_type: v as LoanType },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 border-none bg-transparent shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="interest_only">
                              Interest Only
                            </SelectItem>
                            <SelectItem value="principal_and_interest">
                              P&I
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() =>
                            dispatch({
                              type: "REMOVE_DEBT_LOAN",
                              payload: l.id,
                            })
                          }
                        >
                          <Trash2 className="size-3.5 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No debt loans added
            </p>
          )}
        </CardContent>
      </Card>

      {/* Equity Partners */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Equity Partners</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddEquity}>
            <Plus className="mr-1 size-3.5" />
            Add Partner
          </Button>
        </CardHeader>
        <CardContent>
          {state.equityPartners.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-2 font-medium">Name</th>
                    <th className="w-20 pb-2 pr-2 font-medium">Developer</th>
                    <th className="w-28 pb-2 pr-2 font-medium">
                      Distribution
                    </th>
                    <th className="w-28 pb-2 pr-2 font-medium">Amount</th>
                    <th className="w-20 pb-2 pr-2 font-medium">Return %</th>
                    <th className="w-10 pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {state.equityPartners.map((e) => (
                    <tr key={e.id} className="border-b border-border/50">
                      <td className="py-1 pr-2">
                        <Input
                          value={e.name}
                          onChange={(ev) =>
                            dispatch({
                              type: "UPDATE_EQUITY_PARTNER",
                              payload: {
                                id: e.id,
                                changes: { name: ev.target.value },
                              },
                            })
                          }
                          className="h-8 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1 pr-2 text-center">
                        <input
                          type="checkbox"
                          checked={e.is_developer_equity}
                          onChange={(ev) =>
                            dispatch({
                              type: "UPDATE_EQUITY_PARTNER",
                              payload: {
                                id: e.id,
                                changes: {
                                  is_developer_equity: ev.target.checked,
                                },
                              },
                            })
                          }
                          className="accent-primary"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Select
                          value={e.distribution_type}
                          onValueChange={(v) =>
                            dispatch({
                              type: "UPDATE_EQUITY_PARTNER",
                              payload: {
                                id: e.id,
                                changes: { distribution_type: v },
                              },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 border-none bg-transparent shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="proportional">
                              Proportional
                            </SelectItem>
                            <SelectItem value="preferred">Preferred</SelectItem>
                            <SelectItem value="fixed">Fixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          step="1"
                          min={0}
                          value={centsToDisplay(e.equity_amount)}
                          onChange={(ev) =>
                            dispatch({
                              type: "UPDATE_EQUITY_PARTNER",
                              payload: {
                                id: e.id,
                                changes: {
                                  equity_amount: displayToCents(
                                    ev.target.value
                                  ),
                                },
                              },
                            })
                          }
                          className="h-8 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <Input
                          type="number"
                          step="0.1"
                          min={0}
                          value={e.return_percentage}
                          onChange={(ev) =>
                            dispatch({
                              type: "UPDATE_EQUITY_PARTNER",
                              payload: {
                                id: e.id,
                                changes: {
                                  return_percentage:
                                    parseFloat(ev.target.value) || 0,
                                },
                              },
                            })
                          }
                          className="h-8 w-20 border-none bg-transparent px-1 shadow-none"
                        />
                      </td>
                      <td className="py-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() =>
                            dispatch({
                              type: "REMOVE_EQUITY_PARTNER",
                              payload: e.id,
                            })
                          }
                        >
                          <Trash2 className="size-3.5 text-muted-foreground" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No equity partners added
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
