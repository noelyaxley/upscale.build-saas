"use client";

import { useMemo, useState } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  FeasibilityState,
  FeasibilityAction,
  FeasibilitySummary,
  LineItemSection,
  DevelopmentType,
} from "@/lib/feasibility/types";
import { LineItemsTable } from "./line-items-table";
import { formatCurrency } from "./currency-helpers";

interface CostsTabProps {
  state: FeasibilityState;
  dispatch: React.Dispatch<FeasibilityAction>;
  summary: FeasibilitySummary;
}

interface CostSection {
  key: LineItemSection;
  label: string;
  defaultTabs: string[];
  summaryValue: (s: FeasibilitySummary) => number;
}

const BASE_SECTIONS: CostSection[] = [
  {
    key: "professional_fees",
    label: "Professional Fees",
    defaultTabs: ["DA Costs", "BA Costs", "General"],
    summaryValue: (s) => s.professionalFees,
  },
  {
    key: "construction",
    label: "Construction",
    defaultTabs: ["Building", "External", "Other"],
    summaryValue: (s) => s.constructionCosts,
  },
  {
    key: "dev_fees",
    label: "Development Fees",
    defaultTabs: ["Council", "Statutory", "Other"],
    summaryValue: (s) => s.devFees,
  },
  {
    key: "land_holding",
    label: "Land Holding",
    defaultTabs: ["Rates", "Insurance", "Other"],
    summaryValue: (s) => s.landHoldingCosts,
  },
  {
    key: "contingency",
    label: "Contingency",
    defaultTabs: ["Default"],
    summaryValue: (s) => s.contingencyCosts,
  },
];

function getSections(devType: DevelopmentType): CostSection[] {
  let sections = [...BASE_SECTIONS];

  // Land subdivision: hide construction
  if (devType === "land_subdivision") {
    sections = sections.filter((s) => s.key !== "construction");
  }

  // Industrial: adjust construction sub-tabs
  if (devType === "industrial") {
    sections = sections.map((s) =>
      s.key === "construction"
        ? { ...s, defaultTabs: ["Siteworks", "Building", "Other"] }
        : s
    );
  }

  return sections;
}

export function CostsTab({ state, dispatch, summary }: CostsTabProps) {
  const devType = state.scenario.development_type;
  const sections = useMemo(() => getSections(devType), [devType]);

  const [activeSection, setActiveSection] = useState<LineItemSection>(
    sections[0].key
  );

  const currentSection = sections.find((s) => s.key === activeSection) ?? sections[0];

  // Get unique tab names for this section from existing items, or use defaults
  const existingTabs = [
    ...new Set(
      state.lineItems
        .filter((i) => i.section === activeSection)
        .map((i) => i.tab_name)
    ),
  ];
  const tabNames =
    existingTabs.length > 0 ? existingTabs : currentSection.defaultTabs;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {/* Section navigation pills */}
        <div className="flex flex-wrap items-center gap-2">
          {sections.map((sec) => (
            <Button
              key={sec.key}
              variant={sec.key === activeSection ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(sec.key)}
            >
              {sec.label}
            </Button>
          ))}
        </div>

        {/* Sub-tabs within section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{currentSection.label}</CardTitle>
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
              {tabNames.map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-4">
                  <LineItemsTable
                    items={state.lineItems}
                    section={activeSection}
                    tabName={tab}
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
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Cost Summary sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="size-4 text-lime-500" />
              Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sections.map((sec) => (
              <div key={sec.key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{sec.label}</span>
                <span className="font-medium">
                  {formatCurrency(sec.summaryValue(summary))}
                </span>
              </div>
            ))}
            <div className="border-t pt-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Total Costs (ex Land)</span>
                <span>
                  {formatCurrency(
                    sections.reduce((sum, sec) => sum + sec.summaryValue(summary), 0)
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
