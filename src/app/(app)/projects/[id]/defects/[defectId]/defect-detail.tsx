"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  MapPin,
  User,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type DefectStatus = Database["public"]["Enums"]["defect_status"];

type Defect = Tables<"defects"> & {
  assigned_company: { id: string; name: string } | null;
  reported_by: { id: string; full_name: string | null } | null;
};

type Company = {
  id: string;
  name: string;
  type: string;
};

interface DefectDetailProps {
  project: { id: string; code: string; name: string };
  defect: Defect;
  companies: Company[];
}

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  contractor_complete: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  contractor_complete: "Contractor Complete",
  closed: "Closed",
};

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DefectDetail({ project, defect, companies }: DefectDetailProps) {
  const [contractorComment, setContractorComment] = useState(defect.contractor_comment || "");
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const { isAdmin } = useOrganisation();
  const supabase = createClient();

  const handleStatusChange = async (newStatus: DefectStatus) => {
    setUpdating(true);
    try {
      const updates: {
        status: DefectStatus;
        date_contractor_complete?: string | null;
        date_closed?: string | null;
        contractor_comment?: string | null;
      } = { status: newStatus };

      if (newStatus === "contractor_complete") {
        updates.date_contractor_complete = new Date().toISOString();
        updates.contractor_comment = contractorComment || null;
      } else if (newStatus === "closed") {
        updates.date_closed = new Date().toISOString();
      } else if (newStatus === "open") {
        updates.date_contractor_complete = null;
        updates.date_closed = null;
      }

      const { error } = await supabase
        .from("defects")
        .update(updates)
        .eq("id", defect.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignmentChange = async (companyId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("defects")
        .update({ assigned_to_company_id: companyId || null })
        .eq("id", defect.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update assignment:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}/defects`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/projects/${project.id}`} className="hover:underline">
              {project.code}
            </Link>
            <ChevronRight className="size-4" />
            <Link href={`/projects/${project.id}/defects`} className="hover:underline">
              Defects
            </Link>
            <ChevronRight className="size-4" />
            <span className="font-mono">D-{String(defect.defect_number).padStart(3, "0")}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{defect.name}</h1>
        </div>
        <Badge variant="secondary" className={statusColors[defect.status]}>
          {statusLabels[defect.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo */}
          {defect.photo_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={defect.photo_url}
                  alt={defect.name}
                  className="rounded-lg border max-h-96 w-auto"
                />
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {defect.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Status Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Workflow</CardTitle>
              <CardDescription>
                Track the defect through remediation stages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visual workflow */}
              <div className="flex items-center justify-center gap-2">
                <div className={`flex flex-col items-center gap-1 ${defect.status === "open" ? "opacity-100" : "opacity-50"}`}>
                  <div className={`size-10 rounded-full flex items-center justify-center ${defect.status === "open" ? "bg-red-100 text-red-600" : "bg-muted"}`}>
                    <AlertTriangle className="size-5" />
                  </div>
                  <span className="text-xs">Open</span>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
                <div className={`flex flex-col items-center gap-1 ${defect.status === "contractor_complete" ? "opacity-100" : "opacity-50"}`}>
                  <div className={`size-10 rounded-full flex items-center justify-center ${defect.status === "contractor_complete" ? "bg-yellow-100 text-yellow-600" : "bg-muted"}`}>
                    <Clock className="size-5" />
                  </div>
                  <span className="text-xs">Review</span>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
                <div className={`flex flex-col items-center gap-1 ${defect.status === "closed" ? "opacity-100" : "opacity-50"}`}>
                  <div className={`size-10 rounded-full flex items-center justify-center ${defect.status === "closed" ? "bg-green-100 text-green-600" : "bg-muted"}`}>
                    <CheckCircle className="size-5" />
                  </div>
                  <span className="text-xs">Closed</span>
                </div>
              </div>

              <Separator />

              {/* Contractor response */}
              {defect.status === "open" && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Contractor Response</p>
                  <Textarea
                    placeholder="Describe the remediation work completed..."
                    value={contractorComment}
                    onChange={(e) => setContractorComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={() => handleStatusChange("contractor_complete")}
                    disabled={updating}
                  >
                    <CheckCircle className="mr-2 size-4" />
                    Mark as Complete
                  </Button>
                </div>
              )}

              {defect.status === "contractor_complete" && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Contractor Comment</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {defect.contractor_comment || "No comment provided."}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusChange("closed")}
                      disabled={updating}
                    >
                      <CheckCircle className="mr-2 size-4" />
                      Approve & Close
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("open")}
                      disabled={updating}
                    >
                      Reject & Reopen
                    </Button>
                  </div>
                </div>
              )}

              {defect.status === "closed" && (
                <div className="text-center py-4">
                  <CheckCircle className="mx-auto size-8 text-green-500" />
                  <p className="mt-2 text-sm font-medium">Defect Closed</p>
                  <p className="text-xs text-muted-foreground">
                    Closed on {formatDate(defect.date_closed)}
                  </p>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => handleStatusChange("open")}
                      disabled={updating}
                    >
                      Reopen Defect
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={defect.assigned_to_company_id || ""}
                onValueChange={handleAssignmentChange}
                disabled={updating || defect.status === "closed"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign to contractor" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {defect.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{defect.location}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Reported By</p>
                  <p className="text-sm font-medium">
                    {defect.reported_by?.full_name || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p className="text-sm font-medium">
                    {defect.assigned_company?.name || "Unassigned"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Reported</p>
                  <p className="text-sm font-medium">{formatDate(defect.created_at)}</p>
                </div>
              </div>

              {defect.date_contractor_complete && (
                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-yellow-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Work Completed</p>
                    <p className="text-sm font-medium">
                      {formatDate(defect.date_contractor_complete)}
                    </p>
                  </div>
                </div>
              )}

              {defect.date_closed && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Closed</p>
                    <p className="text-sm font-medium">{formatDate(defect.date_closed)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
