"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  SaleType,
  GstStatus,
  ProductType,
} from "@/lib/feasibility/types";
import { DEFAULT_SALES_TABS } from "@/lib/feasibility/constants";
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

const SALE_TYPES: { value: SaleType; label: string }[] = [
  { value: "vacant_possession", label: "Vacant Possession" },
  { value: "sale_with_lease", label: "Sale with Lease" },
];

interface TabInfo {
  name: string;
  productType: ProductType;
}

/**
 * Derive tab list from existing units + development_type defaults.
 * If units exist, use their tab_name + product_type.
 * Otherwise fall back to DEFAULT_SALES_TABS for the development type.
 */
function deriveTabs(state: FeasibilityState): TabInfo[] {
  const seen = new Map<string, ProductType>();
  for (const u of state.salesUnits) {
    if (!seen.has(u.tab_name)) {
      seen.set(u.tab_name, u.product_type);
    }
  }
  if (seen.size > 0) {
    return Array.from(seen, ([name, productType]) => ({ name, productType }));
  }
  const devType = state.scenario.development_type;
  return DEFAULT_SALES_TABS[devType] ?? DEFAULT_SALES_TABS.residential;
}

// ---------- Column config per product type ----------

interface ColumnDef {
  key: string;
  header: string;
  width: string;
  align?: "right";
}

const RESIDENTIAL_COLUMNS: ColumnDef[] = [
  { key: "name", header: "Unit", width: "" },
  { key: "status", header: "Status", width: "w-24" },
  { key: "bedrooms", header: "Beds", width: "w-14" },
  { key: "bathrooms", header: "Bath", width: "w-14" },
  { key: "car_spaces", header: "Car", width: "w-14" },
  { key: "area_m2", header: "Area m\u00B2", width: "w-20" },
  { key: "sale_price", header: "Sale Price", width: "w-28" },
  { key: "gst_status", header: "GST", width: "w-24" },
  { key: "settlement_month", header: "Settle Mth", width: "w-20" },
  { key: "per_m2", header: "$/m\u00B2", width: "w-20", align: "right" },
  { key: "ex_gst", header: "Ex GST", width: "w-28", align: "right" },
  { key: "actions", header: "", width: "w-10" },
];

const COMMERCIAL_COLUMNS: ColumnDef[] = [
  { key: "name", header: "Unit", width: "" },
  { key: "status", header: "Status", width: "w-24" },
  { key: "sale_type", header: "Sale Type", width: "w-36" },
  { key: "area_m2", header: "Area m\u00B2", width: "w-20" },
  { key: "sale_price", header: "Sale Price", width: "w-28" },
  { key: "per_m2", header: "$/m\u00B2", width: "w-20", align: "right" },
  { key: "cap_rate", header: "Cap Rate %", width: "w-20" },
  { key: "gst_status", header: "GST", width: "w-24" },
  { key: "settlement_month", header: "Settle Mth", width: "w-20" },
  { key: "ex_gst", header: "Ex GST", width: "w-28", align: "right" },
  { key: "actions", header: "", width: "w-10" },
];

const INDUSTRIAL_COLUMNS: ColumnDef[] = [
  { key: "name", header: "Unit", width: "" },
  { key: "status", header: "Status", width: "w-24" },
  { key: "sale_type", header: "Sale Type", width: "w-36" },
  { key: "area_m2", header: "Area m\u00B2", width: "w-20" },
  { key: "sale_price", header: "Sale Price", width: "w-28" },
  { key: "per_m2", header: "$/m\u00B2", width: "w-20", align: "right" },
  { key: "gst_status", header: "GST", width: "w-24" },
  { key: "settlement_month", header: "Settle Mth", width: "w-20" },
  { key: "ex_gst", header: "Ex GST", width: "w-28", align: "right" },
  { key: "actions", header: "", width: "w-10" },
];

const COLUMNS_BY_TYPE: Record<ProductType, ColumnDef[]> = {
  residential: RESIDENTIAL_COLUMNS,
  commercial: COMMERCIAL_COLUMNS,
  industrial: INDUSTRIAL_COLUMNS,
};

function dataColumnCount(cols: ColumnDef[]) {
  // Count columns before "ex_gst" for the Total row colspan
  const idx = cols.findIndex((c) => c.key === "ex_gst");
  return idx > 0 ? idx : cols.length - 2;
}

// ---------- Cell renderer ----------

function UnitCell({
  col,
  unit,
  exGst,
  perM2,
  onUpdate,
  onRemove,
}: {
  col: ColumnDef;
  unit: SalesUnit;
  exGst: number;
  perM2: number;
  onUpdate: (id: string, changes: Partial<SalesUnit>) => void;
  onRemove: (id: string) => void;
}) {
  switch (col.key) {
    case "name":
      return (
        <td className="py-1 pr-2">
          <Input
            value={unit.name}
            onChange={(e) => onUpdate(unit.id, { name: e.target.value })}
            className="h-8 border-none bg-transparent px-1 shadow-none"
          />
        </td>
      );
    case "status":
      return (
        <td className="py-1 pr-2">
          <Select
            value={unit.status}
            onValueChange={(v) =>
              onUpdate(unit.id, { status: v as SaleStatus })
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
      );
    case "sale_type":
      return (
        <td className="py-1 pr-2">
          <Select
            value={unit.sale_type}
            onValueChange={(v) =>
              onUpdate(unit.id, { sale_type: v as SaleType })
            }
          >
            <SelectTrigger className="h-8 border-none bg-transparent shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SALE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
      );
    case "bedrooms":
      return (
        <td className="py-1 pr-2">
          <Input
            type="number"
            min={0}
            value={unit.bedrooms}
            onChange={(e) =>
              onUpdate(unit.id, { bedrooms: parseInt(e.target.value) || 0 })
            }
            className="h-8 w-14 border-none bg-transparent px-1 shadow-none"
          />
        </td>
      );
    case "bathrooms":
      return (
        <td className="py-1 pr-2">
          <Input
            type="number"
            min={0}
            value={unit.bathrooms}
            onChange={(e) =>
              onUpdate(unit.id, { bathrooms: parseInt(e.target.value) || 0 })
            }
            className="h-8 w-14 border-none bg-transparent px-1 shadow-none"
          />
        </td>
      );
    case "car_spaces":
      return (
        <td className="py-1 pr-2">
          <Input
            type="number"
            min={0}
            value={unit.car_spaces}
            onChange={(e) =>
              onUpdate(unit.id, { car_spaces: parseInt(e.target.value) || 0 })
            }
            className="h-8 w-14 border-none bg-transparent px-1 shadow-none"
          />
        </td>
      );
    case "area_m2":
      return (
        <td className="py-1 pr-2">
          <Input
            type="number"
            step="0.01"
            min={0}
            value={unit.area_m2 ?? ""}
            onChange={(e) =>
              onUpdate(unit.id, {
                area_m2: parseFloat(e.target.value) || null,
              })
            }
            className="h-8 w-20 border-none bg-transparent px-1 shadow-none"
          />
        </td>
      );
    case "sale_price":
      return (
        <td className="py-1 pr-2">
          <Input
            type="number"
            step="1"
            min={0}
            value={centsToDisplay(unit.sale_price)}
            onChange={(e) =>
              onUpdate(unit.id, { sale_price: displayToCents(e.target.value) })
            }
            className="h-8 border-none bg-transparent px-1 shadow-none"
          />
        </td>
      );
    case "cap_rate":
      return (
        <td className="py-1 pr-2">
          <Input
            type="number"
            step="0.01"
            min={0}
            value={unit.cap_rate ?? ""}
            onChange={(e) =>
              onUpdate(unit.id, {
                cap_rate: parseFloat(e.target.value) || null,
              })
            }
            className="h-8 w-20 border-none bg-transparent px-1 shadow-none"
          />
        </td>
      );
    case "gst_status":
      return (
        <td className="py-1 pr-2">
          <GstSelect
            value={unit.gst_status}
            onChange={(v: GstStatus) =>
              onUpdate(unit.id, { gst_status: v })
            }
            className="h-8 border-none bg-transparent shadow-none"
          />
        </td>
      );
    case "settlement_month":
      return (
        <td className="py-1 pr-2">
          <Input
            type="number"
            min={1}
            value={unit.settlement_month ?? ""}
            onChange={(e) =>
              onUpdate(unit.id, {
                settlement_month: e.target.value
                  ? parseInt(e.target.value) || null
                  : null,
              })
            }
            placeholder="Last"
            className="h-8 w-20 border-none bg-transparent px-1 shadow-none"
          />
        </td>
      );
    case "per_m2":
      return (
        <td className="py-1 pr-2 text-right text-xs text-muted-foreground">
          {perM2 > 0 ? formatCurrency(perM2) : "-"}
        </td>
      );
    case "ex_gst":
      return (
        <td className="py-1 pr-2 text-right font-medium">
          {formatCurrency(exGst)}
        </td>
      );
    case "actions":
      return (
        <td className="py-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onRemove(unit.id)}
          >
            <Trash2 className="size-3.5 text-muted-foreground" />
          </Button>
        </td>
      );
    default:
      return <td />;
  }
}

// ---------- Add Tab Dialog ----------

function AddTabDialog({
  existingNames,
  onAdd,
}: {
  existingNames: string[];
  onAdd: (name: string, productType: ProductType) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [productType, setProductType] = useState<ProductType>("residential");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || existingNames.includes(trimmed)) return;
    onAdd(trimmed, productType);
    setName("");
    setProductType("residential");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-1 h-7 px-2 text-xs">
          <Plus className="mr-1 size-3" />
          Add Tab
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Sales Tab</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input
                className="col-span-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tower A, Retail"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <Select
                value={productType}
                onValueChange={(v) => setProductType(v as ProductType)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Component ----------

export function SalesTab({ state, dispatch, summary }: SalesTabProps) {
  const [salesCostSection, setSalesCostSection] = useState<
    "agent_fees" | "legal_fees"
  >("agent_fees");

  const tabs = useMemo(() => deriveTabs(state), [state]);
  const [customTabs, setCustomTabs] = useState<TabInfo[]>([]);

  // Merge derived + custom tabs (custom tabs that aren't already derived)
  const allTabs = useMemo(() => {
    const merged = [...tabs];
    for (const ct of customTabs) {
      if (!merged.some((t) => t.name === ct.name)) {
        merged.push(ct);
      }
    }
    return merged;
  }, [tabs, customTabs]);

  const handleAddTab = (name: string, productType: ProductType) => {
    setCustomTabs((prev) => [...prev, { name, productType }]);
  };

  const handleAddUnit = (tabName: string, productType: ProductType) => {
    const isCommercialOrIndustrial =
      productType === "commercial" || productType === "industrial";
    const newUnit: SalesUnit = {
      id: crypto.randomUUID(),
      scenario_id: state.scenario.id,
      tab_name: tabName,
      name: `Unit ${state.salesUnits.filter((u) => u.tab_name === tabName).length + 1}`,
      status: "unsold",
      product_type: productType,
      sale_type: isCommercialOrIndustrial ? "vacant_possession" : "vacant_possession",
      cap_rate: null,
      bedrooms: 0,
      bathrooms: 0,
      car_spaces: 0,
      area_m2: null,
      sale_price: 0,
      gst_status: "exclusive",
      amount_ex_gst: 0,
      settlement_month: null,
      sort_order: state.salesUnits.length,
    };
    dispatch({ type: "ADD_SALES_UNIT", payload: newUnit });
  };

  const handleUpdateUnit = (id: string, changes: Partial<SalesUnit>) => {
    dispatch({ type: "UPDATE_SALES_UNIT", payload: { id, changes } });
  };

  const handleRemoveUnit = (id: string) => {
    dispatch({ type: "REMOVE_SALES_UNIT", payload: id });
  };

  return (
    <div className="space-y-6">
      {/* Sales Units */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sales Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={allTabs[0]?.name}>
            <div className="flex items-center">
              <TabsList variant="line">
                {allTabs.map((tab) => (
                  <TabsTrigger key={tab.name} value={tab.name}>
                    {tab.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              <AddTabDialog
                existingNames={allTabs.map((t) => t.name)}
                onAdd={handleAddTab}
              />
            </div>
            {allTabs.map((tab) => {
              const units = state.salesUnits.filter(
                (u) => u.tab_name === tab.name
              );
              const columns = COLUMNS_BY_TYPE[tab.productType];
              const totalColSpan = dataColumnCount(columns);
              const tabTotal = units.reduce(
                (s, u) =>
                  s + normalizeToExGst(u.sale_price || 0, u.gst_status),
                0
              );
              return (
                <TabsContent key={tab.name} value={tab.name} className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          {columns.map((col) => (
                            <th
                              key={col.key}
                              className={`pb-2 pr-2 font-medium ${col.width} ${col.align === "right" ? "text-right" : ""}`}
                            >
                              {col.header}
                            </th>
                          ))}
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
                              {columns.map((col) => (
                                <UnitCell
                                  key={col.key}
                                  col={col}
                                  unit={unit}
                                  exGst={exGst}
                                  perM2={perM2}
                                  onUpdate={handleUpdateUnit}
                                  onRemove={handleRemoveUnit}
                                />
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                      {units.length > 0 && (
                        <tfoot>
                          <tr className="border-t font-medium">
                            <td
                              colSpan={totalColSpan}
                              className="py-2 pr-2 text-right text-xs"
                            >
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
                    onClick={() => handleAddUnit(tab.name, tab.productType)}
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
