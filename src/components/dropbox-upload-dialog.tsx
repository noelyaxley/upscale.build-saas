"use client";

import { useState, useRef, type ReactNode } from "react";
import { Upload, X, File as FileIcon } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";

const MAX_TOTAL_SIZE = 250 * 1024 * 1024; // 250MB

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DropboxUploadDialogProps {
  projectId: string;
  subfolder: string;
  onUploaded: () => void;
  children: ReactNode;
}

export function DropboxUploadDialog({
  projectId,
  subfolder,
  onUploaded,
  children,
}: DropboxUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
  const sizeExceeded = totalSize > MAX_TOTAL_SIZE;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
      setError(null);
    }
    // Reset input so the same files can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to upload");
      return;
    }
    if (sizeExceeded) {
      setError("Total file size exceeds 250MB limit");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      for (const file of selectedFiles) {
        formData.append("files", file);
      }
      formData.append("projectId", projectId);
      if (subfolder) formData.append("subfolder", subfolder);

      setUploadStatus(`Uploading ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""}...`);
      setProgress(20);

      const res = await fetch("/api/dropbox/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      setUploadStatus("Done!");
      setOpen(false);
      setSelectedFiles([]);
      setProgress(0);
      setUploadStatus("");
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload files");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && loading) return;
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedFiles([]);
      setError(null);
      setProgress(0);
      setUploadStatus("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload to Dropbox</DialogTitle>
            <DialogDescription>
              Upload files to the linked Dropbox folder (max 250MB total)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Upload className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Click to select files
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, i) => (
                  <div
                    key={`${file.name}-${i}`}
                    className="flex items-center gap-2 rounded-md border px-3 py-2"
                  >
                    <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm">{file.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                  <span>
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}
                  </span>
                  <span className={sizeExceeded ? "text-destructive font-medium" : ""}>
                    {formatSize(totalSize)} / 250 MB
                  </span>
                </div>
              </div>
            )}

            {loading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-center text-muted-foreground">
                  {uploadStatus}
                </p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedFiles.length === 0 || sizeExceeded}
            >
              {loading
                ? "Uploading..."
                : `Upload ${selectedFiles.length > 0 ? selectedFiles.length : ""} file${selectedFiles.length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
