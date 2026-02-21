"use client";

import { Copy, GitCompare, Plus, Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateScenarioDialog } from "@/components/create-scenario-dialog";
import type { DevelopmentType } from "@/lib/feasibility/types";
import { DEVELOPMENT_TYPE_LABELS } from "@/lib/feasibility/constants";

interface ScenarioHeaderProps {
  project: { id: string; code: string; name: string };
  scenarios: { id: string; name: string }[];
  selectedId: string;
  developmentType?: DevelopmentType;
  onSelectScenario: (id: string) => void;
  onSave: () => void;
  onDuplicate?: () => void;
  onPrint?: () => void;
  onCompare?: (scenarioId: string | null) => void;
  compareScenarioId?: string | null;
  saving: boolean;
  isDirty?: boolean;
}

export function ScenarioHeader({
  project,
  scenarios,
  selectedId,
  developmentType,
  onSelectScenario,
  onSave,
  onDuplicate,
  onPrint,
  onCompare,
  compareScenarioId,
  saving,
  isDirty = false,
}: ScenarioHeaderProps) {
  const otherScenarios = scenarios.filter((s) => s.id !== selectedId);

  return (
    <>
      <PageHeader
        backHref={`/projects/${project.id}`}
        title={project.name}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "Feasibility" },
        ]}
        badge={
          developmentType ? (
            <Badge variant="secondary" className="text-xs">
              {DEVELOPMENT_TYPE_LABELS[developmentType]}
            </Badge>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3" data-no-print>
        <Select value={selectedId} onValueChange={onSelectScenario}>
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
          <>
            <Button size="sm" onClick={onSave} disabled={saving} className="relative">
              <Save className="mr-2 size-4" />
              {saving ? "Saving..." : "Save"}
              {isDirty && !saving && (
                <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-orange-500" />
              )}
            </Button>
            {onDuplicate && (
              <Button variant="outline" size="sm" onClick={onDuplicate} disabled={saving}>
                <Copy className="mr-2 size-4" />
                Duplicate
              </Button>
            )}
            {onPrint && (
              <Button variant="outline" size="sm" onClick={onPrint}>
                <Printer className="mr-2 size-4" />
                Print
              </Button>
            )}
            {onCompare && otherScenarios.length > 0 && (
              <div className="flex items-center gap-2">
                <GitCompare className="size-4 text-muted-foreground" />
                <Select
                  value={compareScenarioId ?? "none"}
                  onValueChange={(v) => onCompare(v === "none" ? null : v)}
                >
                  <SelectTrigger className="h-8 w-[180px]">
                    <SelectValue placeholder="Compare with..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No comparison</SelectItem>
                    {otherScenarios.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
