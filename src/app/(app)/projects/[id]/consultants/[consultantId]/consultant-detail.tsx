"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  DollarSign,
  FileText,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, Database } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type ConsultantStatus = Database["public"]["Enums"]["consultant_status"];
type PhaseStatus = Database["public"]["Enums"]["phase_status"];

type Consultant = Tables<"consultants"> & {
  company: { id: string; name: string } | null;
  created_by: { id: string; full_name: string | null } | null;
};

type Phase = Tables<"consultant_phases">;

interface ConsultantDetailProps {
  project: { id: string; code: string; name: string };
  consultant: Consultant;
  phases: Phase[];
}

const statusColors: Record<ConsultantStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  engaged: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  terminated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<ConsultantStatus, string> = {
  draft: "Draft",
  engaged: "Engaged",
  completed: "Completed",
  terminated: "Terminated",
};

const phaseStatusColors: Record<PhaseStatus, string> = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

const phaseStatusLabels: Record<PhaseStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ConsultantDetail({
  project,
  consultant,
  phases,
}: ConsultantDetailProps) {
  const [updating, setUpdating] = useState(false);
  const [addPhaseOpen, setAddPhaseOpen] = useState(false);
  const [addPhaseLoading, setAddPhaseLoading] = useState(false);
  const [editingPaidId, setEditingPaidId] = useState<string | null>(null);
  const [editingDisbursementsId, setEditingDisbursementsId] = useState<string | null>(null);
  const [, setEditValue] = useState("");
  const [newPhase, setNewPhase] = useState({
    phaseName: "",
    fee: "",
    notes: "",
  });
  const router = useRouter();
  const { isAdmin } = useOrganisation();
  const supabase = createClient();

  // Financial calculations
  const totalFees = phases.reduce((sum, p) => sum + p.fee, 0);
  const totalVariations = phases.reduce((sum, p) => sum + p.variations, 0);
  const totalDisbursements = phases.reduce((sum, p) => sum + p.disbursements, 0);
  const totalPaid = phases.reduce((sum, p) => sum + p.amount_paid, 0);
  const totalRemaining =
    (consultant.contract_value ?? 0) + totalVariations - totalPaid;

  const handleStatusChange = async (newStatus: ConsultantStatus) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("consultants")
        .update({ status: newStatus })
        .eq("id", consultant.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddPhaseLoading(true);
    try {
      const feeCents = newPhase.fee
        ? Math.round(parseFloat(newPhase.fee) * 100)
        : 0;

      const { error } = await supabase.from("consultant_phases").insert({
        consultant_id: consultant.id,
        phase_name: newPhase.phaseName,
        fee: feeCents,
        notes: newPhase.notes || null,
        sort_order: phases.length,
      });

      if (error) throw error;
      setAddPhaseOpen(false);
      setNewPhase({ phaseName: "", fee: "", notes: "" });
      router.refresh();
    } catch (err) {
      console.error("Failed to add phase:", err);
    } finally {
      setAddPhaseLoading(false);
    }
  };

  const handleDeletePhase = async (phaseId: string, phaseName: string) => {
    if (!window.confirm(`Delete phase "${phaseName}"?`)) return;
    try {
      const { error } = await supabase
        .from("consultant_phases")
        .delete()
        .eq("id", phaseId);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to delete phase:", err);
    }
  };

  const handleInlineUpdate = async (
    phaseId: string,
    field: "amount_paid" | "disbursements",
    value: string
  ) => {
    try {
      const cents = value ? Math.round(parseFloat(value) * 100) : 0;
      const { error } = await supabase
        .from("consultant_phases")
        .update({ [field]: cents })
        .eq("id", phaseId);

      if (error) throw error;
      setEditingPaidId(null);
      setEditingDisbursementsId(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to update phase:", err);
    }
  };

  const handlePhaseStatusUpdate = async (
    phaseId: string,
    newStatus: PhaseStatus
  ) => {
    try {
      const { error } = await supabase
        .from("consultant_phases")
        .update({ status: newStatus })
        .eq("id", phaseId);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update phase status:", err);
    }
  };

  const workflowSteps = [
    { key: "draft", label: "Draft", icon: FileText },
    { key: "engaged", label: "Engaged", icon: Users },
    { key: "completed", label: "Completed", icon: CheckCircle },
  ];

  const currentStepIndex = workflowSteps.findIndex(
    (s) => s.key === consultant.status
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}/consultants`}>
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
            <Link
              href={`/projects/${project.id}/consultants`}
              className="hover:underline"
            >
              Consultants
            </Link>
            <ChevronRight className="size-4" />
            <span className="font-mono">
              C-{String(consultant.consultant_number).padStart(3, "0")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {consultant.discipline}
          </h1>
        </div>
        <Badge
          variant="secondary"
          className={statusColors[consultant.status]}
        >
          {statusLabels[consultant.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consultant Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Building2 className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">
                      {consultant.company?.name || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Discipline</p>
                    <p className="text-sm font-medium">
                      {consultant.discipline}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Contract Ref
                    </p>
                    <p className="text-sm font-medium">
                      {consultant.contract_ref || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created By</p>
                    <p className="text-sm font-medium">
                      {consultant.created_by?.full_name || "-"}
                    </p>
                  </div>
                </div>
              </div>
              {consultant.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">
                      {consultant.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Phases table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Contract Phases</CardTitle>
                  <CardDescription>
                    {phases.length} phase{phases.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Dialog open={addPhaseOpen} onOpenChange={setAddPhaseOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 size-4" />
                      Add Phase
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[450px]">
                    <form onSubmit={handleAddPhase}>
                      <DialogHeader>
                        <DialogTitle>Add Phase</DialogTitle>
                        <DialogDescription>
                          Add a contract phase for this consultant
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="phase-name"
                            className="text-right"
                          >
                            Phase
                          </Label>
                          <Input
                            id="phase-name"
                            placeholder="e.g. Schematic Design"
                            className="col-span-3"
                            value={newPhase.phaseName}
                            onChange={(e) =>
                              setNewPhase({
                                ...newPhase,
                                phaseName: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phase-fee" className="text-right">
                            Fee ($)
                          </Label>
                          <Input
                            id="phase-fee"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="col-span-3"
                            value={newPhase.fee}
                            onChange={(e) =>
                              setNewPhase({
                                ...newPhase,
                                fee: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label
                            htmlFor="phase-notes"
                            className="text-right pt-2"
                          >
                            Notes
                          </Label>
                          <Textarea
                            id="phase-notes"
                            placeholder="Optional notes..."
                            className="col-span-3"
                            value={newPhase.notes}
                            onChange={(e) =>
                              setNewPhase({
                                ...newPhase,
                                notes: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAddPhaseOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addPhaseLoading}>
                          {addPhaseLoading ? "Adding..." : "Add Phase"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {phases.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="mx-auto size-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No phases added yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add contract phases to track fees and payments
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phase</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                      <TableHead className="text-right">Variations</TableHead>
                      <TableHead className="text-right">
                        Disbursements
                      </TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead>Status</TableHead>
                      {isAdmin && (
                        <TableHead className="w-[80px]">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phases.map((phase) => {
                      const phaseRemaining =
                        phase.fee + phase.variations - phase.amount_paid;
                      return (
                        <TableRow key={phase.id}>
                          <TableCell className="font-medium">
                            {phase.phase_name}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(phase.fee)}
                          </TableCell>
                          <TableCell className="text-right">
                            {phase.variations !== 0
                              ? formatCurrency(phase.variations)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingDisbursementsId === phase.id ? (
                              <Input
                                type="number"
                                step="0.01"
                                className="w-24 ml-auto text-right"
                                defaultValue={(
                                  phase.disbursements / 100
                                ).toString()}
                                autoFocus
                                onBlur={(e) =>
                                  handleInlineUpdate(
                                    phase.id,
                                    "disbursements",
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleInlineUpdate(
                                      phase.id,
                                      "disbursements",
                                      (e.target as HTMLInputElement).value
                                    );
                                  } else if (e.key === "Escape") {
                                    setEditingDisbursementsId(null);
                                  }
                                }}
                              />
                            ) : (
                              <button
                                className="hover:underline cursor-pointer"
                                onClick={() => {
                                  setEditingDisbursementsId(phase.id);
                                  setEditValue(
                                    (phase.disbursements / 100).toString()
                                  );
                                }}
                              >
                                {phase.disbursements !== 0
                                  ? formatCurrency(phase.disbursements)
                                  : "-"}
                              </button>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingPaidId === phase.id ? (
                              <Input
                                type="number"
                                step="0.01"
                                className="w-24 ml-auto text-right"
                                defaultValue={(
                                  phase.amount_paid / 100
                                ).toString()}
                                autoFocus
                                onBlur={(e) =>
                                  handleInlineUpdate(
                                    phase.id,
                                    "amount_paid",
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleInlineUpdate(
                                      phase.id,
                                      "amount_paid",
                                      (e.target as HTMLInputElement).value
                                    );
                                  } else if (e.key === "Escape") {
                                    setEditingPaidId(null);
                                  }
                                }}
                              />
                            ) : (
                              <button
                                className="hover:underline cursor-pointer"
                                onClick={() => {
                                  setEditingPaidId(phase.id);
                                  setEditValue(
                                    (phase.amount_paid / 100).toString()
                                  );
                                }}
                              >
                                {phase.amount_paid !== 0
                                  ? formatCurrency(phase.amount_paid)
                                  : "-"}
                              </button>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                phaseRemaining < 0
                                  ? "text-red-600"
                                  : phaseRemaining > 0
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              {formatCurrency(phaseRemaining)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => {
                                const next: Record<PhaseStatus, PhaseStatus> = {
                                  pending: "in_progress",
                                  in_progress: "completed",
                                  completed: "pending",
                                };
                                handlePhaseStatusUpdate(
                                  phase.id,
                                  next[phase.status]
                                );
                              }}
                            >
                              <Badge
                                variant="secondary"
                                className={`cursor-pointer ${phaseStatusColors[phase.status]}`}
                              >
                                {phaseStatusLabels[phase.status]}
                              </Badge>
                            </button>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() =>
                                  handleDeletePhase(
                                    phase.id,
                                    phase.phase_name
                                  )
                                }
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                    {/* Totals row */}
                    <TableRow className="font-medium border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalFees)}
                      </TableCell>
                      <TableCell className="text-right">
                        {totalVariations !== 0
                          ? formatCurrency(totalVariations)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {totalDisbursements !== 0
                          ? formatCurrency(totalDisbursements)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {totalPaid !== 0 ? formatCurrency(totalPaid) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            totalRemaining < 0
                              ? "text-red-600"
                              : totalRemaining > 0
                              ? "text-green-600"
                              : ""
                          }
                        >
                          {formatCurrency(totalRemaining)}
                        </span>
                      </TableCell>
                      <TableCell />
                      {isAdmin && <TableCell />}
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Status Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Workflow</CardTitle>
              <CardDescription>
                Manage consultant engagement status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {consultant.status !== "terminated" && (
                <div className="flex items-center justify-center gap-2">
                  {workflowSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.key === consultant.status;
                    const isPast = index < currentStepIndex;
                    const isFuture = index > currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        className="flex items-center gap-2"
                      >
                        {index > 0 && (
                          <ArrowRight
                            className={`size-4 ${
                              isPast
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        )}
                        <div
                          className={`flex flex-col items-center gap-1 ${
                            isFuture ? "opacity-50" : ""
                          }`}
                        >
                          <div
                            className={`size-10 rounded-full flex items-center justify-center ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : isPast
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-muted"
                            }`}
                          >
                            <Icon className="size-5" />
                          </div>
                          <span className="text-xs">{step.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Separator />

              {consultant.status === "draft" && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Engage Consultant</p>
                  <p className="text-sm text-muted-foreground">
                    Mark this consultant as actively engaged on the project.
                  </p>
                  <Button
                    onClick={() => handleStatusChange("engaged")}
                    disabled={updating}
                  >
                    <Users className="mr-2 size-4" />
                    Engage
                  </Button>
                </div>
              )}

              {consultant.status === "engaged" && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Complete Engagement</p>
                  <p className="text-sm text-muted-foreground">
                    Mark this consultant engagement as completed.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusChange("completed")}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 size-4" />
                      Complete
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to terminate this consultant?"
                          )
                        ) {
                          handleStatusChange("terminated");
                        }
                      }}
                      disabled={updating}
                    >
                      Terminate
                    </Button>
                  </div>
                </div>
              )}

              {consultant.status === "completed" && (
                <div className="text-center py-4">
                  <CheckCircle className="mx-auto size-8 text-green-500" />
                  <p className="mt-2 text-sm font-medium">
                    Engagement Completed
                  </p>
                </div>
              )}

              {consultant.status === "terminated" && (
                <div className="text-center py-4">
                  <div className="size-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Trash2 className="size-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-red-600">
                    Engagement Terminated
                  </p>
                </div>
              )}

              {(consultant.status === "completed" ||
                consultant.status === "terminated") &&
                isAdmin && (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("draft")}
                      disabled={updating}
                    >
                      Reopen as Draft
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(consultant.budget ?? 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Contract Value
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(consultant.contract_value ?? 0)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Variations
                  </p>
                  <p className="text-sm font-medium">
                    {totalVariations !== 0
                      ? formatCurrency(totalVariations)
                      : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Disbursements
                  </p>
                  <p className="text-sm font-medium">
                    {totalDisbursements !== 0
                      ? formatCurrency(totalDisbursements)
                      : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="text-sm font-medium">
                    {totalPaid !== 0 ? formatCurrency(totalPaid) : "-"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p
                    className={`text-lg font-bold ${
                      totalRemaining < 0
                        ? "text-red-600"
                        : totalRemaining > 0
                        ? "text-green-600"
                        : ""
                    }`}
                  >
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(consultant.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {formatDate(consultant.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
