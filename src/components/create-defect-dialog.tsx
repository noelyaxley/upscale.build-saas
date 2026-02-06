"use client";

import { useState, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Camera, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useOrganisation } from "@/lib/context/organisation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CreateDefectDialogProps {
  projectId: string;
  companies: { id: string; name: string; type: string }[];
  children: ReactNode;
}

export function CreateDefectDialog({
  projectId,
  companies,
  children,
}: CreateDefectDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    assignedCompanyId: "",
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let photoUrl: string | null = null;

      // Upload photo if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${organisation.id}/${projectId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("defect-photos")
          .upload(filePath, selectedImage);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("defect-photos")
          .getPublicUrl(filePath);

        photoUrl = urlData.publicUrl;
      }

      // Create defect record
      const { error: insertError } = await supabase.from("defects").insert({
        org_id: organisation.id,
        project_id: projectId,
        name: formData.name,
        description: formData.description || null,
        location: formData.location || null,
        photo_url: photoUrl,
        assigned_to_company_id: formData.assignedCompanyId || null,
        reported_by_user_id: profile.id,
      });

      if (insertError) {
        throw insertError;
      }

      setOpen(false);
      setFormData({
        name: "",
        description: "",
        location: "",
        assignedCompanyId: "",
      });
      setSelectedImage(null);
      setImagePreview(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create defect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Defect</DialogTitle>
            <DialogDescription>
              Record a defect for tracking and remediation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Photo upload */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Photo</Label>
              <div className="col-span-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-auto rounded-lg border object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 size-6"
                      onClick={removeImage}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="mr-2 size-4" />
                    Add Photo
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="defect-name" className="text-right">
                Name
              </Label>
              <Input
                id="defect-name"
                placeholder="Brief description of the defect"
                className="col-span-3"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="defect-location" className="text-right">
                Location
              </Label>
              <Input
                id="defect-location"
                placeholder="e.g., Unit 5, Bathroom"
                className="col-span-3"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="defect-desc" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="defect-desc"
                placeholder="Detailed description of the defect..."
                className="col-span-3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="defect-company" className="text-right">
                Assign To
              </Label>
              <Select
                value={formData.assignedCompanyId}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedCompanyId: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select contractor/supplier" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Log Defect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
