"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Download,
  File,
  FileText,
  Folder,
  FolderPlus,
  Image,
  LinkIcon,
  MoreVertical,
  Trash2,
  Unlink,
  Upload,
} from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { UploadDocumentDialog } from "@/components/upload-document-dialog";
import { CreateFolderDialog } from "@/components/create-folder-dialog";
import { DeleteDocumentDialog } from "@/components/delete-document-dialog";
import { DropboxFileBrowser } from "@/components/dropbox-file-browser";
import { DropboxFolderPickerDialog } from "@/components/dropbox-folder-picker-dialog";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

type DocumentFolder = Tables<"document_folders">;
type Document = Tables<"documents"> & {
  uploaded_by: { full_name: string | null } | null;
};

interface DropboxConnectionInfo {
  id: string;
  project_id: string;
  dropbox_folder_id: string | null;
  dropbox_folder_path: string | null;
}

interface DocumentsViewProps {
  project: { id: string; code: string; name: string };
  folders: DocumentFolder[];
  documents: Document[];
  currentFolderId: string | null;
  breadcrumbs: { id: string | null; name: string }[];
  dropboxConnection: DropboxConnectionInfo | null;
  dropboxJustConnected?: boolean;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getFileIcon(fileType: string | null) {
  if (!fileType) return File;
  if (fileType.startsWith("image/")) return Image;
  if (fileType === "application/pdf") return FileText;
  return File;
}

export function DocumentsView({
  project,
  folders,
  documents,
  currentFolderId,
  breadcrumbs,
  dropboxConnection,
  dropboxJustConnected,
}: DocumentsViewProps) {
  const { isAdmin } = useOrganisation();
  const router = useRouter();
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const hasDropboxFolder =
    dropboxConnection?.dropbox_folder_id && dropboxConnection?.dropbox_folder_path;

  // Auto-open folder picker after initial OAuth connection
  useEffect(() => {
    if (dropboxJustConnected && dropboxConnection && !hasDropboxFolder) {
      setFolderPickerOpen(true);
    }
  }, [dropboxJustConnected, dropboxConnection, hasDropboxFolder]);

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Dropbox from this project?")) return;
    setDisconnecting(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase
        .from("dropbox_connections")
        .delete()
        .eq("project_id", project.id);
      router.refresh();
    } finally {
      setDisconnecting(false);
    }
  };

  const handleFolderSelected = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/projects/${project.id}`}
        title={project.name}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "Documents" },
        ]}
      >
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <CreateFolderDialog
                projectId={project.id}
                parentFolderId={currentFolderId}
              >
                <Button variant="outline" size="sm">
                  <FolderPlus className="mr-2 size-4" />
                  New Folder
                </Button>
              </CreateFolderDialog>
              <UploadDocumentDialog
                projectId={project.id}
                folderId={currentFolderId}
              >
                <Button size="sm">
                  <Upload className="mr-2 size-4" />
                  Upload
                </Button>
              </UploadDocumentDialog>
            </>
          )}
        </div>
      </PageHeader>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id ?? "root"} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="size-4 text-muted-foreground" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium">{crumb.name}</span>
            ) : (
              <Link
                href={`/projects/${project.id}/documents${crumb.id ? `?folder=${crumb.id}` : ""}`}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                {crumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <DocumentsCard
        project={project}
        folders={folders}
        documents={documents}
        isAdmin={isAdmin}
      />

      {/* Dropbox card — shown to admins always, and to non-admins when connected with folder */}
      {(isAdmin || hasDropboxFolder) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dropbox</CardTitle>
                <CardDescription>
                  {hasDropboxFolder
                    ? dropboxConnection!.dropbox_folder_path
                    : dropboxConnection
                      ? "Select a folder to browse Dropbox files"
                      : "Connect your Dropbox account to sync project files"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && !dropboxConnection && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/api/dropbox/auth?projectId=${project.id}`}>
                      <LinkIcon className="mr-2 size-4" />
                      Connect Dropbox
                    </a>
                  </Button>
                )}
                {isAdmin && dropboxConnection && !hasDropboxFolder && (
                  <Button size="sm" onClick={() => setFolderPickerOpen(true)}>
                    Select Folder
                  </Button>
                )}
                {isAdmin && hasDropboxFolder && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFolderPickerOpen(true)}
                    >
                      Change Folder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                    >
                      <Unlink className="mr-2 size-4" />
                      {disconnecting ? "Disconnecting..." : "Disconnect"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasDropboxFolder ? (
              <DropboxFileBrowser
                projectId={project.id}
                dropboxFolderPath={dropboxConnection!.dropbox_folder_path!}
              />
            ) : !dropboxConnection ? (
              <div className="py-8 text-center">
                <Folder className="mx-auto size-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect Dropbox to browse and upload project files
                </p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Folder className="mx-auto size-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Select a Dropbox folder to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Folder Picker Dialog */}
      {dropboxConnection && (
        <DropboxFolderPickerDialog
          open={folderPickerOpen}
          onOpenChange={setFolderPickerOpen}
          projectId={project.id}
          onFolderSelected={handleFolderSelected}
        />
      )}
    </div>
  );
}

// Extracted existing documents card to avoid duplication in tabs
function DocumentsCard({
  project,
  folders,
  documents,
  isAdmin,
}: {
  project: { id: string };
  folders: DocumentFolder[];
  documents: Document[];
  isAdmin: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Files & Folders</CardTitle>
        <CardDescription>
          {folders.length} folder{folders.length !== 1 ? "s" : ""},{" "}
          {documents.length} document{documents.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {folders.length === 0 && documents.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No files or folders yet"
            description={isAdmin ? "Upload documents or create folders to get started" : undefined}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Revision</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Folders */}
              {folders.map((folder) => (
                <TableRow key={folder.id}>
                  <TableCell>
                    <Link
                      href={`/projects/${project.id}/documents?folder=${folder.id}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Folder className="size-4 text-primary" />
                      <span className="font-medium">{folder.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{formatDate(folder.created_at)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Delete Folder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {/* Documents */}
              {documents.map((doc) => {
                const FileIcon = getFileIcon(doc.file_type);
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileIcon className="size-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.document_number}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.current_revision}</Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                    <TableCell>{formatDate(doc.uploaded_at)}</TableCell>
                    <TableCell>
                      {doc.uploaded_by?.full_name || "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={doc.file_name}
                            >
                              <Download className="mr-2 size-4" />
                              Download
                            </a>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DeleteDocumentDialog document={doc}>
                              <DropdownMenuItem
                                className="text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                              </DropdownMenuItem>
                            </DeleteDocumentDialog>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
