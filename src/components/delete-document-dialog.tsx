"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
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

type Document = Tables<"documents">;

interface DeleteDocumentDialogProps {
  document: Document;
  children: ReactNode;
}

export function DeleteDocumentDialog({
  document,
  children,
}: DeleteDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      // Delete from database first
      const { error: deleteError } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);

      if (deleteError) {
        throw deleteError;
      }

      // Try to delete from storage (extract path from URL)
      // The file_url contains the full public URL, we need to extract the path
      try {
        const url = new URL(document.file_url);
        const pathParts = url.pathname.split("/storage/v1/object/public/project-documents/");
        if (pathParts[1]) {
          await supabase.storage.from("project-documents").remove([pathParts[1]]);
        }
      } catch {
        // Ignore storage deletion errors - the db record is already deleted
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete document</DialogTitle>
              <DialogDescription>This action cannot be undone</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <strong>{document.title}</strong> ({document.document_number})?
            This will permanently remove the document and its file.
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
