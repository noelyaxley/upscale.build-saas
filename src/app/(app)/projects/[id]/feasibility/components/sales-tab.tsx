"use client";

import { useState } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  FeasibilityState,
  FeasibilityAction,
  FeasibilitySummary,
  SalesUnit,
  SaleStatus,
  GstStatus,
} from "@/lib/feasibility/types";
import { normalizeToExGst } from "@/lib/feasibility/gst";
import { GstSelect } from "./gst-select";
import { LineItemsTable } from "./line-items-table";
import {
  formatCurrency,
  centsToDisplay,
  displayToCents,
} from "./currency-helpers";

interface SalesTabProps {
  state: FeasibilityState;
  dispatch: React.Dispatch<FeasibilityAction>;
  summary: FeasibilitySummary;
}

const SALE_STATUSES: SaleStatus[] = [
  "unsold",
  "exchanged",
  "settled",
  "withdrawn",
];

export function SalesTab({ state, dispatch, summary }: SalesTabProps) {
  const [salesCostSection, setSalesCostSection] = useState<
    "agent_fees" | "legal_fees"
  >("agent_fees");

  // Get unique product types from units
  const productTypes = [
    ...new Set(state.salesUnits.map((u) => u.tab_name)),
  ];
  const tabNames = productTypes.length > 0 ? productTypes : ["Residential"];

  const handleAddUnit = (tabName: string) => {
    const newUnit: SalesUnit = {
      id: crypto.randomUUID(),
      scenario_id: state.scenario.id,
      tab_name: tabName,
      name: `Unit ${state.salesUnits.filter((u) => u.tab_name === tabName).length + 1}`,
      status: "unsold",
      bedrooms: 0,
      bathrooms: 0,
      car_spaces: 0,
      area_m2: null,
      sale_price: 0,
      gst_status: "exclusive",
      amount_ex_gst: 0,
      sort_order: state.salesUnits.length,
    };
    dispatch({ type: "ADD_SALES_UNIT", payload: newUnit });
  };

  const handleUpdateUnit = (id: string, changes: Partial<SalesUnit>) => {
    dispatch({ type: "UPDATE_SALES_UNIT", payload: { id, changes } });
  };

  return (
    <div className="space-y-6">
      {/* Sales Units */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tabNames[0]}>
            <TabsList variant="line">
              {tabNames.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabNames.map((tabName) => {
              const units = state.salesUnits.filter(
                (u) => u.tab_name === tabName
              );
              const tabTotal = units.reduce(
                (s, u) => s + normalizeToExGst(u.sale_price || 0, u.gst_status),
                0
              );
              return (
                <TabsContent key={tabName} value={tabName} className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-2 font-medium">Unit</th>
                          <th className="w-24 pb-2 pr-2 font-medium">
                            Status
                          </th>
                          <th className="w-14 pb-2 pr-2 font-medium">Beds</th>
                          <th className="w-14 pb-2 pr-2 font-medium">Bath</th>
                          <th className="w-14 pb-2 pr-2 font-medium">Car</th>
                          <th className="w-20 pb-2 pr-2 font-medium">
                            Area m2
                          </th>
                          <th className="w-28 pb-2 pr-2 font-medium">
                            Sale Price
                          </th>
                          <th className="w-24 pb-2 pr-2 font-medium">GST</th>
                          <th className="w-20 pb-2 pr-2 text-right font-medium">
                            $/m2
                          </th>
                          <th className="w-28 pb-2 pr-2 text-right font-medium">
                            Ex GST
                          </th>
                          <th className="w-10 pb-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {units.map((unit) => {
                          const exGst = normalizeToExGst(
                            unit.sale_price || 0,
                            unit.gst_status
                          );
                          const perM2 =
                            unit.area_m2 && unit.area_m2 > 0
                              ? Math.round(exGst / unit.area_m2)
                              : 0;
                          return (
                            <tr
                              key={unit.id}
                              className="border-b border-border/50"
                            >
                              <td className="py-1 pr-2">
                                <Input
                                  value={unit.name}
                                  onChange={(e) =>
                                    handleUpdateUnit(unit.id, {
                                      name: e.target.value,
                                    })
                                  }
                                  className="h-8 border-none bg-transparent px-1 shadow-none"
                                />
                              </td>
                              <td className="py-1 pr-2">
                                <Select
                                  value={unit.status}
                                  onValueChange={(v) =>
                                    handleUpdateUnit(unit.id, {
                                      status: v as SaleStatus,
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8 border-none bg-transparent shadow-none">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {SALE_STATUSES.map((s) => (
                                      <SelectItem key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="py-1 pr-2">
                                <Input
                                  type="number"
                                  min={0}
                                  value={unit.bedrooms}
                                  onChange={(e) =>
                                    handleUpdateUnit(unit.id, {
                                      bedrooms: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="h-8 w-14 border-none bg-transparent px-1 shadow-none"
                                />
                              </td>
                              <td className="py-1 pr-2">
                                <Input
                                  type="number"
                                  min={0}
                                  value={unit.bathrooms}
                                  onChange={(e) =>
                                    handleUpdateUnit(unit.id, {
                                      bathrooms: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="h-8 w-14 border-none bg-transparent px-1 shadow-none"
                                />
                              </td>
                              <td className="py-1 pr-2">
                                <Input
                                  type="number"
                                  min={0}
                                  value={unit.car_spaces}
                                  onChange={(e) =>
                                    handleUpdateUnit(unit.id, {
                                      car_spaces:
                                        parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="h-8 w-14 border-none bg-transparent px-1 shadow-none"
                                />
                              </td>
                              <td className="py-1 pr-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  value={unit.area_m2 ?? ""}
                                  onChange={(e) =>
                                    handleUpdateUnit(unit.id, {
                                      area_m2:
                                        parseFloat(e.target.value) || null,
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
                                  value={centsToDisplay(unit.sale_price)}
                                  onChange={(e) =>
                                    handleUpdateUnit(unit.id, {
                                      sale_price: displayToCents(
                                        e.target.value
                                      ),
                                    })
                                  }
                                  className="h-8 border-none bg-transparent px-1 shadow-none"
                                />
                              </td>
                              <td className="py-1 pr-2">
                                <GstSelect
                                  value={unit.gst_status}
                                  onChange={(v: GstStatus) =>
                                    handleUpdateUnit(unit.id, {
                                      gst_status: v,
                                    })
                                  }
                                  className="h-8 border-none bg-transparent shadow-none"
                                />
                              </td>
                              <td className="py-1 pr-2 text-right text-xs text-muted-foreground">
                                {perM2 > 0
                                  ? formatCurrency(perM2)
                                  : "-"}
                              </td>
                              <td className="py-1 pr-2 text-right font-medium">
                                {formatCurrency(exGst)}
                              </td>
                              <td className="py-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={() =>
                                    dispatch({
                                      type: "REMOVE_SALES_UNIT",
                                      payload: unit.id,
                                    })
                                  }
                                >
                                  <Trash2 className="size-3.5 text-muted-foreground" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {units.length > 0 && (
                        <tfoot>
                          <tr className="border-t font-medium">
                            <td colSpan={9} className="py-2 pr-2 text-right text-xs">
                              Total
                            </td>
                            <td className="py-2 pr-2 text-right">
                              {formatCurrency(tabTotal)}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleAddUnit(tabName)}
                  >
                    <Plus className="mr-1 size-3.5" />
                    Add Unit
                  </Button>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Sales Costs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <Button
              variant={salesCostSection === "agent_fees" ? "default" : "outline"}
              size="sm"
              onClick={() => setSalesCostSection("agent_fees")}
            >
              Agent Fees
            </Button>
            <Button
              variant={salesCostSection === "legal_fees" ? "default" : "outline"}
              size="sm"
              onClick={() => setSalesCostSection("legal_fees")}
            >
              Legal Fees
            </Button>
          </div>
          <LineItemsTable
            items={state.lineItems}
            section={salesCostSection}
            tabName="Default"
            scenarioId={state.scenario.id}
            summary={summary}
            onAdd={(item) =>
              dispatch({ type: "ADD_LINE_ITEM", payload: item })
            }
            onUpdate={(id, changes) =>
              dispatch({
                type: "UPDATE_LINE_ITEM",
                payload: { id, changes },
              })
            }
            onRemove={(id) =>
              dispatch({ type: "REMOVE_LINE_ITEM", payload: id })
            }
          />
        </CardContent>
      </Card>

      {/* Summary sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="size-4 text-lime-500" />
            Sales Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Revenue</span>
            <span className="font-medium text-emerald-600">
              {formatCurrency(summary.totalRevenue)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Revenue Ex GST</span>
            <span className="font-medium">
              {formatCurrency(summary.totalRevenueExGst)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Units</span>
            <span className="font-medium">{summary.unitCount}</span>
          </div>
          {summary.unitCount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg per Unit</span>
              <span className="font-medium">
                {formatCurrency(summary.revenuePerUnit)}
              </span>
            </div>
          )}
          <div className="border-t pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Agent Fees</span>
              <span className="font-medium">
                {formatCurrency(summary.agentFees)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Legal Fees</span>
              <span className="font-medium">
                {formatCurrency(summary.legalFees)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
