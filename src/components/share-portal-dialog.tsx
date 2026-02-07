"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrganisation } from "@/lib/context/organisation";
import { Badge } from "@/components/ui/badge";
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
import { getErrorMessage } from "@/lib/utils";

type PortalLink = {
  id: string;
  token: string;
  name: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
};

interface SharePortalDialogProps {
  projectId: string;
  children: ReactNode;
}

export function SharePortalDialog({
  projectId,
  children,
}: SharePortalDialogProps) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<PortalLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  // Fetch existing links when dialog opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("client_portal_links")
      .select("id, token, name, is_active, expires_at, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setLinks(data ?? []);
        setLoading(false);
      });
  }, [open, projectId, supabase]);

  const getPortalUrl = (token: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/client-portal/${token}`;
  };

  const handleCopy = async (link: PortalLink) => {
    try {
      await navigator.clipboard.writeText(getPortalUrl(link.token));
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  const handleDeactivate = async (linkId: string) => {
    const { error: updateError } = await supabase
      .from("client_portal_links")
      .update({ is_active: false })
      .eq("id", linkId);

    if (!updateError) {
      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, is_active: false } : l))
      );
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("client_portal_links")
        .insert({
          org_id: organisation.id,
          project_id: projectId,
          name: newName || "Client Access",
          expires_at: newExpiry || null,
          created_by_user_id: profile.id,
        })
        .select("id, token, name, is_active, expires_at, created_at")
        .single();

      if (insertError) throw insertError;

      if (data) {
        setLinks((prev) => [data, ...prev]);
      }
      setNewName("");
      setNewExpiry("");
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create link"));
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Share with Client</DialogTitle>
          <DialogDescription>
            Create shareable links for external clients to view project status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Existing links */}
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : links.length === 0 && !showForm ? (
            <p className="text-sm text-muted-foreground">
              No links created yet. Create one to share project access with
              clients.
            </p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{link.name}</p>
                      {link.is_active ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {getPortalUrl(link.token)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(link.created_at)}
                      {link.expires_at &&
                        ` · Expires ${formatDate(link.expires_at)}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {link.is_active && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(link)}
                          title="Copy link"
                        >
                          {copiedId === link.id ? (
                            <Check className="size-4 text-green-500" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeactivate(link.id)}
                          title="Deactivate"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create form */}
          {showForm ? (
            <form onSubmit={handleCreate} className="space-y-3 border-t pt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="link-name"
                  placeholder="e.g. Client Access"
                  className="col-span-3"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link-expiry" className="text-right">
                  Expires
                </Label>
                <Input
                  id="link-expiry"
                  type="date"
                  className="col-span-3"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={creating}>
                  {creating ? "Creating..." : "Create Link"}
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
              className="w-full"
            >
              <Plus className="mr-2 size-4" />
              New Link
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
