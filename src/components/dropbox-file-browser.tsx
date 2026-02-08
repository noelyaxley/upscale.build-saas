"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronRight,
  Download,
  File,
  FileText,
  Folder,
  FolderInput,
  FolderPlus,
  Image,
  Loader2,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropboxUploadDialog } from "@/components/dropbox-upload-dialog";

interface DropboxEntry {
  ".tag": "file" | "folder";
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  size?: number;
  server_modified?: string;
  temporary_link?: string | null;
}

interface DropboxFileBrowserProps {
  projectId: string;
  dropboxFolderPath: string;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date?: string): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(ext || ""))
    return Image;
  if (ext === "pdf") return FileText;
  return File;
}

export function DropboxFileBrowser({
  projectId,
  dropboxFolderPath,
}: DropboxFileBrowserProps) {
  const [entries, setEntries] = useState<DropboxEntry[]>([]);
  const [subpath, setSubpath] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastClickedRef = useRef<string | null>(null);

  // Drag and drop
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  // New folder dialog
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderLoading, setNewFolderLoading] = useState(false);
  const [newFolderError, setNewFolderError] = useState<string | null>(null);

  // Rename dialog
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameEntry, setRenameEntry] = useState<DropboxEntry | null>(null);
  const [renameName, setRenameName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  // Move-to dialog
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [moveDialogPath, setMoveDialogPath] = useState("");
  const [moveDialogEntries, setMoveDialogEntries] = useState<DropboxEntry[]>(
    []
  );
  const [moveDialogLoading, setMoveDialogLoading] = useState(false);
  const [moveLoading, setMoveLoading] = useState(false);
  const [moveError, setMoveError] = useState<string | null>(null);

  // Delete confirmation dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<DropboxEntry[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const pathParts = subpath ? subpath.split("/").filter(Boolean) : [];

  const allEntries = [
    ...entries.filter((e) => e[".tag"] === "folder"),
    ...entries.filter((e) => e[".tag"] === "file"),
  ];

  const folders = entries.filter((e) => e[".tag"] === "folder");
  const files = entries.filter((e) => e[".tag"] === "file");

  // ── Fetch entries ──

  const fetchEntries = useCallback(
    async (sub: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ projectId });
        if (sub) params.set("subpath", sub);
        const res = await fetch(`/api/dropbox/list?${params}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load files");
        }
        const data = await res.json();
        setEntries(data.entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load files");
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    fetchEntries(subpath);
  }, [subpath, fetchEntries]);

  // ── Navigation ──

  const navigateToFolder = (entry: DropboxEntry) => {
    const relativePath = entry.path_display
      .slice(dropboxFolderPath.length)
      .replace(/^\//, "");
    setSubpath(relativePath);
    setSelectedIds(new Set());
  };

  const navigateToSubpath = (sub: string) => {
    setSubpath(sub);
    setSelectedIds(new Set());
  };

  // ── Selection ──

  const toggleSelection = (
    id: string,
    e: React.MouseEvent | React.PointerEvent
  ) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (e.shiftKey && lastClickedRef.current) {
        // Range select
        const ids = allEntries.map((en) => en.id);
        const from = ids.indexOf(lastClickedRef.current);
        const to = ids.indexOf(id);
        if (from !== -1 && to !== -1) {
          const [start, end] = from < to ? [from, to] : [to, from];
          for (let i = start; i <= end; i++) {
            next.add(ids[i]);
          }
        }
      } else if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      lastClickedRef.current = id;
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === allEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allEntries.map((e) => e.id)));
    }
  };

  const selectedEntries = allEntries.filter((e) => selectedIds.has(e.id));

  // ── Move (shared handler for drag-drop & move dialog) ──

  const moveSelectedTo = async (destinationPath: string) => {
    const paths = selectedEntries.map((e) => e.path_display);
    if (paths.length === 0) return;

    setMoving(true);
    try {
      const res = await fetch("/api/dropbox/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          entries: paths,
          destinationFolder: destinationPath,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to move files");
      }
      setSelectedIds(new Set());
      fetchEntries(subpath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move files");
    } finally {
      setMoving(false);
    }
  };

  // ── Drag & Drop ──

  const handleDragStart = (e: React.DragEvent, entry: DropboxEntry) => {
    // If dragging an unselected item, select only it
    if (!selectedIds.has(entry.id)) {
      setSelectedIds(new Set([entry.id]));
    }

    const dragging = selectedIds.has(entry.id) ? selectedEntries : [entry];
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify(dragging.map((en) => en.path_display))
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, entry: DropboxEntry) => {
    if (entry[".tag"] !== "folder" || selectedIds.has(entry.id)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(entry.id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolder: DropboxEntry) => {
    e.preventDefault();
    setDragOverId(null);
    if (targetFolder[".tag"] !== "folder" || selectedIds.has(targetFolder.id))
      return;

    try {
      const paths = JSON.parse(
        e.dataTransfer.getData("application/json")
      ) as string[];
      if (paths.length === 0) return;

      setMoving(true);
      const res = await fetch("/api/dropbox/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          entries: paths,
          destinationFolder: targetFolder.path_display,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to move files");
      }
      setSelectedIds(new Set());
      fetchEntries(subpath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move files");
    } finally {
      setMoving(false);
    }
  };

  // ── Create Folder ──

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setNewFolderLoading(true);
    setNewFolderError(null);
    try {
      const res = await fetch("/api/dropbox/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          subfolder: subpath,
          folderName: newFolderName.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create folder");
      }
      setNewFolderOpen(false);
      setNewFolderName("");
      fetchEntries(subpath);
    } catch (err) {
      setNewFolderError(
        err instanceof Error ? err.message : "Failed to create folder"
      );
    } finally {
      setNewFolderLoading(false);
    }
  };

  // ── Rename ──

  const openRename = (entry: DropboxEntry) => {
    setRenameEntry(entry);
    setRenameName(entry.name);
    setRenameError(null);
    setRenameOpen(true);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameEntry || !renameName.trim()) return;

    setRenameLoading(true);
    setRenameError(null);
    try {
      const res = await fetch("/api/dropbox/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          fromPath: renameEntry.path_display,
          newName: renameName.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to rename");
      }
      setRenameOpen(false);
      setRenameEntry(null);
      setRenameName("");
      fetchEntries(subpath);
    } catch (err) {
      setRenameError(
        err instanceof Error ? err.message : "Failed to rename"
      );
    } finally {
      setRenameLoading(false);
    }
  };

  // ── Delete ──

  const openDelete = (targets: DropboxEntry[]) => {
    setDeleteTargets(targets);
    setDeleteError(null);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (deleteTargets.length === 0) return;

    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/dropbox/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          entries: deleteTargets.map((e) => e.path_display),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setDeleteOpen(false);
      setDeleteTargets([]);
      setSelectedIds(new Set());
      fetchEntries(subpath);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Move To Dialog ──

  const openMoveDialog = () => {
    setMoveDialogPath("");
    setMoveError(null);
    setMoveDialogOpen(true);
    fetchMoveDialogEntries("");
  };

  const fetchMoveDialogEntries = async (sub: string) => {
    setMoveDialogLoading(true);
    try {
      const params = new URLSearchParams({ projectId });
      if (sub) params.set("subpath", sub);
      const res = await fetch(`/api/dropbox/list?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load folders");
      }
      const data = await res.json();
      setMoveDialogEntries(
        (data.entries as DropboxEntry[]).filter((e) => e[".tag"] === "folder")
      );
    } catch {
      setMoveDialogEntries([]);
    } finally {
      setMoveDialogLoading(false);
    }
  };

  const moveDialogNavigate = (sub: string) => {
    setMoveDialogPath(sub);
    fetchMoveDialogEntries(sub);
  };

  const moveDialogPathParts = moveDialogPath
    ? moveDialogPath.split("/").filter(Boolean)
    : [];

  const currentMoveDestination = moveDialogPath
    ? `${dropboxFolderPath}/${moveDialogPath}`
    : dropboxFolderPath;

  const currentMoveDestinationLabel = moveDialogPath
    ? moveDialogPathParts[moveDialogPathParts.length - 1]
    : "Root";

  const handleMoveConfirm = async () => {
    setMoveLoading(true);
    setMoveError(null);
    try {
      await moveSelectedTo(currentMoveDestination);
      setMoveDialogOpen(false);
    } catch (err) {
      setMoveError(err instanceof Error ? err.message : "Failed to move");
    } finally {
      setMoveLoading(false);
    }
  };

  // ── Render ──

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => navigateToSubpath("")}
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            Dropbox
          </button>
          {pathParts.map((part, i) => {
            const sub = pathParts.slice(0, i + 1).join("/");
            const isLast = i === pathParts.length - 1;
            return (
              <span key={sub} className="flex items-center gap-1">
                <ChevronRight className="size-4 text-muted-foreground" />
                {isLast ? (
                  <span className="font-medium">{part}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigateToSubpath(sub)}
                    className="text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {part}
                  </button>
                )}
              </span>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchEntries(subpath)}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewFolderName("");
              setNewFolderError(null);
              setNewFolderOpen(true);
            }}
          >
            <FolderPlus className="mr-2 size-4" />
            New Folder
          </Button>
          <DropboxUploadDialog
            projectId={projectId}
            subfolder={subpath}
            onUploaded={() => fetchEntries(subpath)}
          >
            <Button size="sm">
              <Upload className="mr-2 size-4" />
              Upload
            </Button>
          </DropboxUploadDialog>
        </div>
      </div>

      {/* Selection toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-md border bg-muted/50 px-3 py-2">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={openMoveDialog}
            disabled={moving}
          >
            <FolderInput className="mr-2 size-4" />
            Move to...
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDelete(selectedEntries)}
            disabled={moving}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            <X className="mr-2 size-4" />
            Clear
          </Button>
          {moving && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => fetchEntries(subpath)}
          >
            Retry
          </Button>
        </div>
      ) : folders.length === 0 && files.length === 0 ? (
        <div className="py-8 text-center">
          <Folder className="mx-auto size-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            This folder is empty
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    allEntries.length > 0 &&
                    selectedIds.size === allEntries.length
                  }
                  onCheckedChange={selectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {folders.map((entry) => {
              const isSelected = selectedIds.has(entry.id);
              const isDropTarget = dragOverId === entry.id;
              return (
                <TableRow
                  key={entry.id}
                  draggable={isSelected}
                  onDragStart={(e) => handleDragStart(e, entry)}
                  onDragOver={(e) => handleDragOver(e, entry)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, entry)}
                  className={`${isSelected ? "bg-primary/5" : ""} ${isDropTarget ? "ring-2 ring-inset ring-primary bg-primary/10" : ""}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onClick={(e) => toggleSelection(entry.id, e)}
                      onCheckedChange={() => {}}
                      aria-label={`Select ${entry.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => navigateToFolder(entry)}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Folder className="size-4 text-primary" />
                      <span className="font-medium">{entry.name}</span>
                    </button>
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openRename(entry)}>
                          <Pencil className="mr-2 size-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDelete([entry])}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {files.map((entry) => {
              const FileIcon = getFileIcon(entry.name);
              const isSelected = selectedIds.has(entry.id);
              return (
                <TableRow
                  key={entry.id}
                  draggable={isSelected}
                  onDragStart={(e) => handleDragStart(e, entry)}
                  className={isSelected ? "bg-primary/5" : ""}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onClick={(e) => toggleSelection(entry.id, e)}
                      onCheckedChange={() => {}}
                      aria-label={`Select ${entry.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileIcon className="size-4 text-muted-foreground" />
                      <span>{entry.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(entry.size)}</TableCell>
                  <TableCell>{formatDate(entry.server_modified)}</TableCell>
                  <TableCell>
                    {entry.temporary_link && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        asChild
                      >
                        <a
                          href={entry.temporary_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="size-4" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* New Folder Dialog */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleCreateFolder}>
            <DialogHeader>
              <DialogTitle>New Folder</DialogTitle>
              <DialogDescription>
                Create a new folder in the current directory
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="folder-name">Folder name</Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder"
                  autoFocus
                />
              </div>
              {newFolderError && (
                <p className="text-sm text-destructive">{newFolderError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewFolderOpen(false)}
                disabled={newFolderLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={newFolderLoading || !newFolderName.trim()}
              >
                {newFolderLoading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleRename}>
            <DialogHeader>
              <DialogTitle>Rename Folder</DialogTitle>
              <DialogDescription>
                Enter a new name for &ldquo;{renameEntry?.name}&rdquo;
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="rename-name">Name</Label>
                <Input
                  id="rename-name"
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  autoFocus
                />
              </div>
              {renameError && (
                <p className="text-sm text-destructive">{renameError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameOpen(false)}
                disabled={renameLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  renameLoading ||
                  !renameName.trim() ||
                  renameName === renameEntry?.name
                }
              >
                {renameLoading ? "Renaming..." : "Rename"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Move To Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Move to folder</DialogTitle>
            <DialogDescription>
              Move {selectedIds.size} item{selectedIds.size !== 1 ? "s" : ""} to
              a folder
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm">
              <button
                type="button"
                onClick={() => moveDialogNavigate("")}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                Root
              </button>
              {moveDialogPathParts.map((part, i) => {
                const sub = moveDialogPathParts.slice(0, i + 1).join("/");
                const isLast = i === moveDialogPathParts.length - 1;
                return (
                  <span key={sub} className="flex items-center gap-1">
                    <ChevronRight className="size-4 text-muted-foreground" />
                    {isLast ? (
                      <span className="font-medium">{part}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => moveDialogNavigate(sub)}
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
            <div className="max-h-64 overflow-y-auto rounded-md border">
              {moveDialogLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : moveDialogEntries.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No subfolders
                </div>
              ) : (
                <div className="divide-y">
                  {moveDialogEntries.map((entry) => {
                    // Compute relative subpath for navigation
                    const relativePath = entry.path_display
                      .slice(dropboxFolderPath.length)
                      .replace(/^\//, "");
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => moveDialogNavigate(relativePath)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50"
                      >
                        <Folder className="size-4 text-primary" />
                        <span>{entry.name}</span>
                        <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {moveError && (
              <p className="text-sm text-destructive">{moveError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMoveDialogOpen(false)}
              disabled={moveLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleMoveConfirm} disabled={moveLoading}>
              {moveLoading
                ? "Moving..."
                : `Move to ${currentMoveDestinationLabel}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete {deleteTargets.length > 1 ? "items" : deleteTargets[0]?.[".tag"] === "folder" ? "folder" : "file"}</DialogTitle>
            <DialogDescription>
              {deleteTargets.length === 1
                ? `Are you sure you want to delete "${deleteTargets[0]?.name}"? ${deleteTargets[0]?.[".tag"] === "folder" ? "All contents will be permanently deleted." : "This cannot be undone."}`
                : `Are you sure you want to delete ${deleteTargets.length} items? This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
