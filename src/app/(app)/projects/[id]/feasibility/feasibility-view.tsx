"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  ChevronRight,
  DollarSign,
  Plus,
  Save,
  TrendingUp,
} from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CreateScenarioDialog } from "@/components/create-scenario-dialog";

type Scenario = Tables<"feasibility_scenarios">;

interface FeasibilityViewProps {
  project: { id: string; code: string; name: string };
  scenarios: Scenario[];
}

function formatCurrency(cents: number): string {
  if (cents === 0) return "$0";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function centsToDisplay(cents: number | null): string {
  if (!cents) return "";
  return (cents / 100).toString();
}

function displayToCents(val: string): number {
  if (!val) return 0;
  return Math.round(parseFloat(val) * 100);
}

const costColors = [
  { label: "Site Acquisition", key: "siteCost", color: "bg-red-500" },
  { label: "Construction", key: "constructionCost", color: "bg-orange-500" },
  { label: "Professional Fees", key: "professionalFees", color: "bg-amber-500" },
  { label: "Statutory Fees", key: "statutoryFees", color: "bg-yellow-500" },
  { label: "Finance", key: "financeCosts", color: "bg-lime-500" },
  { label: "Marketing", key: "marketingCosts", color: "bg-green-500" },
  { label: "Contingency", key: "contingency", color: "bg-teal-500" },
] as const;

type CostKey = (typeof costColors)[number]["key"];

interface FormState {
  siteArea: string;
  fsr: string;
  maxHeight: string;
  zoning: string;
  efficiency: string;
  saleRate: string;
  siteCost: string;
  constructionCost: string;
  professionalFees: string;
  statutoryFees: string;
  financeCosts: string;
  marketingCosts: string;
  contingency: string;
}

const emptyForm: FormState = {
  siteArea: "",
  fsr: "",
  maxHeight: "",
  zoning: "",
  efficiency: "80",
  saleRate: "",
  siteCost: "",
  constructionCost: "",
  professionalFees: "",
  statutoryFees: "",
  financeCosts: "",
  marketingCosts: "",
  contingency: "",
};

export function FeasibilityView({
  project,
  scenarios,
}: FeasibilityViewProps) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedId, setSelectedId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  // Derived calculations
  const siteArea = parseFloat(form.siteArea) || 0;
  const fsr = parseFloat(form.fsr) || 0;
  const efficiency = parseFloat(form.efficiency) || 80;
  const saleRate = displayToCents(form.saleRate); // cents per sqm

  const gfa = siteArea * fsr;
  const nsa = gfa * (efficiency / 100);
  const totalRevenue = Math.round(nsa * saleRate); // cents

  const costs: Record<CostKey, number> = {
    siteCost: displayToCents(form.siteCost),
    constructionCost: displayToCents(form.constructionCost),
    professionalFees: displayToCents(form.professionalFees),
    statutoryFees: displayToCents(form.statutoryFees),
    financeCosts: displayToCents(form.financeCosts),
    marketingCosts: displayToCents(form.marketingCosts),
    contingency: displayToCents(form.contingency),
  };

  const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0);
  const profit = totalRevenue - totalCosts;
  const profitOnCost = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

  // Load scenario into form
  const loadScenario = useCallback(
    (scenario: Scenario) => {
      setForm({
        siteArea: scenario.site_area ? String(scenario.site_area) : "",
        fsr: scenario.fsr ? String(scenario.fsr) : "",
        maxHeight: scenario.max_height ? String(scenario.max_height) : "",
        zoning: scenario.zoning || "",
        efficiency: scenario.efficiency ? String(scenario.efficiency) : "80",
        saleRate: centsToDisplay(scenario.sale_rate),
        siteCost: centsToDisplay(scenario.site_cost),
        constructionCost: centsToDisplay(scenario.construction_cost),
        professionalFees: centsToDisplay(scenario.professional_fees),
        statutoryFees: centsToDisplay(scenario.statutory_fees),
        financeCosts: centsToDisplay(scenario.finance_costs),
        marketingCosts: centsToDisplay(scenario.marketing_costs),
        contingency: centsToDisplay(scenario.contingency),
      });
    },
    []
  );

  // When selecting a scenario
  const handleSelectScenario = (id: string) => {
    setSelectedId(id);
    if (id === "new") {
      setForm(emptyForm);
      setSelectedId("");
      return;
    }
    const scenario = scenarios.find((s) => s.id === id);
    if (scenario) loadScenario(scenario);
  };

  // Load first scenario on mount
  useEffect(() => {
    if (scenarios.length > 0 && !selectedId) {
      setSelectedId(scenarios[0].id);
      loadScenario(scenarios[0]);
    }
  }, [scenarios, selectedId, loadScenario]);

  // Save to DB
  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("feasibility_scenarios")
        .update({
          site_area: parseFloat(form.siteArea) || null,
          fsr: parseFloat(form.fsr) || null,
          max_height: parseFloat(form.maxHeight) || null,
          zoning: form.zoning || null,
          efficiency: parseFloat(form.efficiency) || 80,
          gfa: gfa || null,
          nsa: nsa || null,
          sale_rate: saleRate || 0,
          total_revenue: totalRevenue,
          site_cost: costs.siteCost,
          construction_cost: costs.constructionCost,
          professional_fees: costs.professionalFees,
          statutory_fees: costs.statutoryFees,
          finance_costs: costs.financeCosts,
          marketing_costs: costs.marketingCosts,
          contingency: costs.contingency,
          total_costs: totalCosts,
          profit,
          profit_on_cost: Math.round(profitOnCost * 100) / 100,
        })
        .eq("id", selectedId);

      if (error) throw error;
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Cost breakdown percentages for bar chart
  const costEntries = costColors.map((c) => ({
    ...c,
    value: costs[c.key],
    pct: totalCosts > 0 ? (costs[c.key] / totalCosts) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href={`/projects/${project.id}`}
              className="hover:underline"
            >
              {project.code}
            </Link>
            <ChevronRight className="size-4" />
            <span>Feasibility</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {project.name}
          </h1>
        </div>
      </div>

      {/* Scenario controls */}
      <div className="flex items-center gap-3">
        <Select value={selectedId} onValueChange={handleSelectScenario}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select scenario" />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CreateScenarioDialog projectId={project.id}>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 size-4" />
            New Scenario
          </Button>
        </CreateScenarioDialog>
        {selectedId && (
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-2 size-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>

      {scenarios.length === 0 && !selectedId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calculator className="mx-auto size-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No scenarios yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a scenario to start your feasibility analysis
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Panel — Inputs */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="size-4 text-lime-500" />
                  Site Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Site Area (sqm)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.siteArea}
                      onChange={(e) => updateField("siteArea", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">FSR</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.fsr}
                      onChange={(e) => updateField("fsr", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Max Height (m)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.maxHeight}
                      onChange={(e) => updateField("maxHeight", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Zoning</Label>
                    <Input
                      value={form.zoning}
                      onChange={(e) => updateField("zoning", e.target.value)}
                      placeholder="e.g. R4"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">GFA (sqm)</Label>
                    <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                      {gfa.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Efficiency %</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={form.efficiency}
                      onChange={(e) =>
                        updateField("efficiency", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs">NSA (sqm)</Label>
                    <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm font-medium">
                      {nsa.toFixed(1)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="size-4 text-lime-500" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Sale Rate ($/sqm)</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={form.saleRate}
                      onChange={(e) => updateField("saleRate", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Total Revenue</Label>
                    <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm font-bold text-emerald-600">
                      {formatCurrency(totalRevenue)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="size-4 text-lime-500" />
                  Costs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Site Acquisition ($)</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={form.siteCost}
                      onChange={(e) => updateField("siteCost", e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Construction ($)</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={form.constructionCost}
                      onChange={(e) =>
                        updateField("constructionCost", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Professional Fees ($)</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={form.professionalFees}
                      onChange={(e) =>
                        updateField("professionalFees", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Statutory Fees ($)</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={form.statutoryFees}
                      onChange={(e) =>
                        updateField("statutoryFees", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Finance ($)</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={form.financeCosts}
                      onChange={(e) =>
                        updateField("financeCosts", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Marketing ($)</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={form.marketingCosts}
                      onChange={(e) =>
                        updateField("marketingCosts", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Contingency ($)</Label>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      value={form.contingency}
                      onChange={(e) =>
                        updateField("contingency", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Total Costs</Label>
                    <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm font-bold text-red-600">
                      {formatCurrency(totalCosts)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel — Summary */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    GRV (Revenue)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(totalRevenue)}
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
                    {formatCurrency(totalCosts)}
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
                    className={`text-2xl font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {formatCurrency(profit)}
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
                    className={`text-2xl font-bold ${profitOnCost >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {profitOnCost.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {totalCosts > 0 ? (
                  <>
                    {/* Stacked bar */}
                    <div className="flex h-8 w-full overflow-hidden rounded-md">
                      {costEntries
                        .filter((c) => c.pct > 0)
                        .map((c) => (
                          <div
                            key={c.key}
                            className={`${c.color} transition-all`}
                            style={{ width: `${c.pct}%` }}
                            title={`${c.label}: ${formatCurrency(c.value)} (${c.pct.toFixed(1)}%)`}
                          />
                        ))}
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2">
                      {costEntries
                        .filter((c) => c.value > 0)
                        .map((c) => (
                          <div
                            key={c.key}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className={`size-3 rounded-sm ${c.color}`}
                            />
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

            {/* Revenue vs Cost Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Revenue vs Cost
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {totalRevenue > 0 || totalCosts > 0 ? (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium">
                          {formatCurrency(totalRevenue)}
                        </span>
                      </div>
                      <div className="h-6 w-full rounded-md bg-muted overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-md transition-all"
                          style={{
                            width: `${Math.min(100, totalRevenue > 0 && totalCosts > 0 ? (totalRevenue / Math.max(totalRevenue, totalCosts)) * 100 : totalRevenue > 0 ? 100 : 0)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Total Costs
                        </span>
                        <span className="font-medium">
                          {formatCurrency(totalCosts)}
                        </span>
                      </div>
                      <div className="h-6 w-full rounded-md bg-muted overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-md transition-all"
                          style={{
                            width: `${Math.min(100, totalCosts > 0 && totalRevenue > 0 ? (totalCosts / Math.max(totalRevenue, totalCosts)) * 100 : totalCosts > 0 ? 100 : 0)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Enter values to see comparison
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
