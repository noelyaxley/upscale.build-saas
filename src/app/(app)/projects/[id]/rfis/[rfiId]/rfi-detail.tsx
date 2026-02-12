"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle,
  CircleDot,
  Clock,
  Send,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables, Database } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type RFIStatus = Database["public"]["Enums"]["rfi_status"];

type RFI = Tables<"rfis"> & {
  originator: { id: string; full_name: string | null } | null;
  assignee: { id: string; full_name: string | null } | null;
};

type Message = Tables<"rfi_messages"> & {
  author: { id: string; full_name: string | null } | null;
};

type Member = {
  id: string;
  full_name: string | null;
};

interface RFIDetailProps {
  project: { id: string; code: string; name: string };
  rfi: RFI;
  messages: Message[];
  members: Member[];
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "closed") return false;
  return new Date(dueDate) < new Date();
}

export function RFIDetail({ project, rfi, messages }: RFIDetailProps) {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const router = useRouter();
  const { profile } = useOrganisation();
  const supabase = createClient();

  const overdue = isOverdue(rfi.due_date, rfi.status);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from("rfi_messages").insert({
        rfi_id: rfi.id,
        author_user_id: profile.id,
        body: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
      router.refresh();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: RFIStatus) => {
    setUpdatingStatus(true);
    try {
      const updates: { status: RFIStatus; closed_at?: string | null } = {
        status: newStatus,
      };

      if (newStatus === "closed") {
        updates.closed_at = new Date().toISOString();
      } else {
        updates.closed_at = null;
      }

      const { error } = await supabase
        .from("rfis")
        .update(updates)
        .eq("id", rfi.id);

      if (error) throw error;

      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/projects/${project.id}/rfis`}
        title={rfi.subject}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "RFIs", href: `/projects/${project.id}/rfis` },
          { label: `RFI-${String(rfi.number).padStart(3, "0")}` },
        ]}
        badge={
          <Badge variant="secondary" className={statusColors[rfi.status]}>
            {rfi.status.charAt(0).toUpperCase() + rfi.status.slice(1)}
          </Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{rfi.question}</p>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Discussion ({messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No messages yet. Start the discussion below.
                </p>
              ) : (
                messages.map((message) => {
                  const initial = message.author?.full_name?.charAt(0).toUpperCase() || "?";
                  return (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {message.author?.full_name || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(message.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {message.body}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              <Separator />

              {/* Reply form */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Write a response..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[100px]"
                  disabled={rfi.status === "closed"}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim() || rfi.status === "closed"}
                    size="sm"
                  >
                    <Send className="mr-2 size-4" />
                    {sending ? "Sending..." : "Send"}
                  </Button>
                </div>
                {rfi.status === "closed" && (
                  <p className="text-xs text-muted-foreground text-center">
                    This RFI is closed. Reopen it to add messages.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={rfi.status}
                onValueChange={(value: RFIStatus) => handleStatusChange(value)}
                disabled={updatingStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              {rfi.status === "open" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStatusChange("closed")}
                  disabled={updatingStatus}
                >
                  <CheckCircle className="mr-2 size-4" />
                  Close RFI
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">From</p>
                  <p className="text-sm font-medium">
                    {rfi.originator?.full_name || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CircleDot className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p className="text-sm font-medium">
                    {rfi.assignee?.full_name || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${overdue ? "text-destructive" : ""}`}>
                      {formatDate(rfi.due_date)}
                    </p>
                    {overdue && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(rfi.created_at)}
                  </p>
                </div>
              </div>

              {rfi.closed_at && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">Closed</p>
                    <p className="text-sm font-medium">
                      {formatDate(rfi.closed_at)}
                    </p>
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
