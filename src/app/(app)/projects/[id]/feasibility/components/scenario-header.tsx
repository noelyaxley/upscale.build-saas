"use client";

import { Plus, Save } from "lucide-react";
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
  saving: boolean;
}

export function ScenarioHeader({
  project,
  scenarios,
  selectedId,
  developmentType,
  onSelectScenario,
  onSave,
  saving,
}: ScenarioHeaderProps) {
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

      <div className="flex items-center gap-3">
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
          <Button size="sm" onClick={onSave} disabled={saving}>
            <Save className="mr-2 size-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
    </>
  );
}
