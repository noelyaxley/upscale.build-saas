"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  Download,
  File,
  FileText,
  Folder,
  Image,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const pathParts = subpath ? subpath.split("/").filter(Boolean) : [];

  const fetchEntries = useCallback(async (sub: string) => {
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
  }, [projectId]);

  useEffect(() => {
    fetchEntries(subpath);
  }, [subpath, fetchEntries]);

  const navigateToFolder = (entry: DropboxEntry) => {
    // Calculate subpath relative to the project's dropbox folder
    const relativePath = entry.path_display
      .slice(dropboxFolderPath.length)
      .replace(/^\//, "");
    setSubpath(relativePath);
  };

  const navigateToSubpath = (sub: string) => {
    setSubpath(sub);
  };

  const folders = entries.filter((e) => e[".tag"] === "folder");
  const files = entries.filter((e) => e[".tag"] === "file");

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
            <RefreshCw className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
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
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {folders.map((entry) => (
              <TableRow key={entry.id}>
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
                <TableCell />
              </TableRow>
            ))}
            {files.map((entry) => {
              const FileIcon = getFileIcon(entry.name);
              return (
                <TableRow key={entry.id}>
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
                      <Button variant="ghost" size="icon" className="size-8" asChild>
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
    </div>
  );
}
