"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronRight, Folder, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DropboxFolder {
  name: string;
  path_display: string;
  id: string;
}

interface DropboxFolderPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onFolderSelected: (folderId: string, folderPath: string) => void;
}

export function DropboxFolderPickerDialog({
  open,
  onOpenChange,
  projectId,
  onFolderSelected,
}: DropboxFolderPickerDialogProps) {
  const [folders, setFolders] = useState<DropboxFolder[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pathParts = currentPath
    ? currentPath.split("/").filter(Boolean)
    : [];

  const fetchFolders = useCallback(async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ projectId, path });
      const res = await fetch(`/api/dropbox/folders?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load folders");
      }
      const data = await res.json();
      setFolders(data.folders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load folders");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) {
      setCurrentPath("");
      fetchFolders("");
    }
  }, [open, fetchFolders]);

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
    fetchFolders(path);
  };

  const handleSelect = async () => {
    if (!currentPath) {
      setError("Please navigate into a folder to select it");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/dropbox/select-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          folderId: currentPath,
          folderPath: currentPath,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to select folder");
      }
      onFolderSelected(currentPath, currentPath);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select folder");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Dropbox Folder</DialogTitle>
          <DialogDescription>
            Choose the Dropbox folder to link to this project
          </DialogDescription>
        </DialogHeader>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm flex-wrap">
          <button
            type="button"
            onClick={() => navigateToFolder("")}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            Dropbox
          </button>
          {pathParts.map((part, i) => {
            const path = "/" + pathParts.slice(0, i + 1).join("/");
            const isLast = i === pathParts.length - 1;
            return (
              <span key={path} className="flex items-center gap-1">
                <ChevronRight className="size-4 text-muted-foreground" />
                {isLast ? (
                  <span className="font-medium">{part}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigateToFolder(path)}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {part}
                  </button>
                )}
              </span>
            );
          })}
        </nav>

        {/* Folder list */}
        <div className="min-h-[200px] max-h-[300px] overflow-y-auto border rounded-md">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : folders.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No subfolders found
            </div>
          ) : (
            <div className="divide-y">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => navigateToFolder(folder.path_display)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                >
                  <Folder className="size-4 text-primary" />
                  <span>{folder.name}</span>
                  <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={saving || !currentPath}>
            {saving ? "Selecting..." : "Select This Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
