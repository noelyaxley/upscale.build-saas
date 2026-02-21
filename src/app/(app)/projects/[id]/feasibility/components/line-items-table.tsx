"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  LineItem,
  LineItemSection,
  RateType,
  GstStatus,
  HoldingFrequency,
  DebtFacility,
  FeasibilitySummary,
} from "@/lib/feasibility/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveLineItemAmount } from "@/lib/feasibility/calculations";
import { GstSelect } from "./gst-select";
import { RateTypeSelect } from "./rate-type-select";
import { formatCurrency, centsToDisplay, displayToCents } from "./currency-helpers";

interface LineItemsTableProps {
  items: LineItem[];
  section: LineItemSection;
  tabName: string;
  scenarioId: string;
  summary: FeasibilitySummary;
  onAdd: (item: LineItem) => void;
  onUpdate: (id: string, changes: Partial<LineItem>) => void;
  onRemove: (id: string) => void;
  landLotId?: string | null;
  projectLengthMonths?: number;
  debtFacilities?: DebtFacility[];
}

export function LineItemsTable({
  items,
  section,
  tabName,
  scenarioId,
  summary,
  onAdd,
  onUpdate,
  onRemove,
  landLotId,
  projectLengthMonths = 24,
  debtFacilities = [],
}: LineItemsTableProps) {
  const showFrequency = section === "land_holding";
  const filtered = items.filter(
    (i) =>
      i.section === section &&
      i.tab_name === tabName &&
      (landLotId === undefined || i.land_lot_id === landLotId)
  );

  const context = {
    totalLandSize: summary.totalLandSize,
    lotCount: summary.lotCount,
    constructionTotal: summary.constructionCosts,
    grvTotal: summary.totalRevenue,
    projectCostsTotal: summary.projectCostsToFund,
    projectLengthMonths,
  };

  const total = filtered.reduce(
    (sum, item) => sum + resolveLineItemAmount(item, context),
    0
  );

  const handleAdd = () => {
    onAdd({
      id: crypto.randomUUID(),
      scenario_id: scenarioId,
      section,
      tab_name: tabName,
      land_lot_id: landLotId ?? null,
      parent_entity_id: null,
      name: "New Item",
      quantity: 1,
      rate_type: "$ Amount",
      rate: 0,
      gst_status: "exclusive",
      amount_ex_gst: 0,
      frequency: showFrequency ? "monthly" : "once",
      cashflow_start_month: null,
      cashflow_span_months: 1,
      funding_facility_id: null,
      sort_order: filtered.length,
    });
  };

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-2 font-medium">Item</th>
              <th className="w-16 pb-2 pr-2 font-medium">Qty</th>
              <th className="w-32 pb-2 pr-2 font-medium">Rate Type</th>
              <th className="w-28 pb-2 pr-2 font-medium">Rate ($)</th>
              <th className="w-28 pb-2 pr-2 font-medium">GST</th>
              {showFrequency && (
                <th className="w-28 pb-2 pr-2 font-medium">Frequency</th>
              )}
              <th className="w-20 pb-2 pr-2 font-medium">Start Mth</th>
              <th className="w-20 pb-2 pr-2 font-medium">Span</th>
              {debtFacilities.length > 0 && (
                <th className="w-32 pb-2 pr-2 font-medium">Funded By</th>
              )}
              <th className="w-28 pb-2 pr-2 text-right font-medium">
                Amount Ex GST
              </th>
              <th className="w-10 pb-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const resolved = resolveLineItemAmount(item, context);
              return (
                <tr key={item.id} className="border-b border-border/50">
                  <td className="py-1 pr-2">
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        onUpdate(item.id, { name: e.target.value })
                      }
                      className="h-8 border-none bg-transparent px-1 shadow-none"
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        onUpdate(item.id, {
                          quantity: parseFloat(e.target.value) || 1,
                        })
                      }
                      className="h-8 w-16 border-none bg-transparent px-1 shadow-none"
                      min={0}
                      step={0.01}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <RateTypeSelect
                      value={item.rate_type}
                      onChange={(v: RateType) =>
                        onUpdate(item.id, { rate_type: v })
                      }
                      className="h-8 border-none bg-transparent shadow-none"
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      type="number"
                      value={centsToDisplay(item.rate)}
                      onChange={(e) =>
                        onUpdate(item.id, {
                          rate: displayToCents(e.target.value),
                        })
                      }
                      className="h-8 border-none bg-transparent px-1 shadow-none"
                      min={0}
                      step={1}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <GstSelect
                      value={item.gst_status}
                      onChange={(v: GstStatus) =>
                        onUpdate(item.id, { gst_status: v })
                      }
                      className="h-8 border-none bg-transparent shadow-none"
                    />
                  </td>
                  {showFrequency && (
                    <td className="py-1 pr-2">
                      <Select
                        value={item.frequency || "once"}
                        onValueChange={(v) =>
                          onUpdate(item.id, { frequency: v as HoldingFrequency })
                        }
                      >
                        <SelectTrigger className="h-8 border-none bg-transparent shadow-none">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Once</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="semi_annually">Semi-Annual</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  )}
                  <td className="py-1 pr-2">
                    <Input
                      type="number"
                      value={item.cashflow_start_month ?? ""}
                      onChange={(e) =>
                        onUpdate(item.id, {
                          cashflow_start_month:
                            e.target.value ? parseInt(e.target.value) || 1 : null,
                        })
                      }
                      placeholder="1"
                      className="h-8 w-20 border-none bg-transparent px-1 shadow-none"
                      min={1}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      type="number"
                      value={item.cashflow_span_months || 1}
                      onChange={(e) =>
                        onUpdate(item.id, {
                          cashflow_span_months: parseInt(e.target.value) || 1,
                        })
                      }
                      className="h-8 w-20 border-none bg-transparent px-1 shadow-none"
                      min={1}
                    />
                  </td>
                  {debtFacilities.length > 0 && (
                    <td className="py-1 pr-2">
                      <Select
                        value={item.funding_facility_id ?? "__none__"}
                        onValueChange={(v) =>
                          onUpdate(item.id, {
                            funding_facility_id: v === "__none__" ? null : v,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 border-none bg-transparent shadow-none text-xs">
                          <SelectValue placeholder="Auto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Auto</SelectItem>
                          {debtFacilities.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  )}
                  <td className="py-1 pr-2 text-right font-medium">
                    {formatCurrency(resolved)}
                  </td>
                  <td className="py-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => onRemove(item.id)}
                    >
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t font-medium">
                <td colSpan={(showFrequency ? 8 : 7) + (debtFacilities.length > 0 ? 1 : 0)} className="py-2 pr-2 text-right text-xs">
                  Total
                </td>
                <td className="py-2 pr-2 text-right">{formatCurrency(total)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <Button variant="outline" size="sm" onClick={handleAdd}>
        <Plus className="mr-1 size-3.5" />
        Add Item
      </Button>
    </div>
  );
}
