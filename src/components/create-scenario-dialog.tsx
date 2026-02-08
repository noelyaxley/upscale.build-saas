"use client";

import { getErrorMessage } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useOrganisation } from "@/lib/context/organisation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEVELOPMENT_TYPES } from "@/lib/feasibility/constants";

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

interface CreateScenarioDialogProps {
  projectId: string;
  children: ReactNode;
}

export function CreateScenarioDialog({
  projectId,
  children,
}: CreateScenarioDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [developmentType, setDevelopmentType] = useState("residential");
  const [projectLengthMonths, setProjectLengthMonths] = useState("24");
  const [startDate, setStartDate] = useState("");
  const [state, setState] = useState("NSW");
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("feasibility_scenarios")
        .insert({
          org_id: organisation.id,
          project_id: projectId,
          name,
          created_by_user_id: profile.id,
          development_type: developmentType,
          project_length_months: parseInt(projectLengthMonths) || 24,
          start_date: startDate || null,
          state,
        } as Record<string, unknown>);

      if (insertError) throw insertError;

      setOpen(false);
      setName("");
      setDevelopmentType("residential");
      setProjectLengthMonths("24");
      setStartDate("");
      setState("NSW");
      router.refresh();
    } catch (err) {
      setError(
        getErrorMessage(err, "Failed to create scenario")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Scenario</DialogTitle>
            <DialogDescription>
              Create a new feasibility scenario to analyse
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scenario-name" className="text-right">
                Name
              </Label>
              <Input
                id="scenario-name"
                placeholder="e.g. Base Case, Optimistic"
                className="col-span-3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <Select value={developmentType} onValueChange={setDevelopmentType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEVELOPMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AU_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project-length" className="text-right">
                Months
              </Label>
              <Input
                id="project-length"
                type="number"
                min="1"
                className="col-span-3"
                value={projectLengthMonths}
                onChange={(e) => setProjectLengthMonths(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                className="col-span-3"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Scenario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
