"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { getErrorMessage } from "@/lib/utils";

const companyTypes = [
  { value: "builder", label: "Builder" },
  { value: "consultant", label: "Consultant" },
  { value: "client", label: "Client" },
  { value: "subcontractor", label: "Subcontractor" },
  { value: "supplier", label: "Supplier" },
  { value: "other", label: "Other" },
];

export function CreateCompanyDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, isAdmin } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    type: "other",
    abn: "",
    address: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("companies").insert({
        org_id: organisation.id,
        name: formData.name,
        type: formData.type,
        abn: formData.abn || null,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
      });

      if (insertError) {
        throw insertError;
      }

      setOpen(false);
      setFormData({
        name: "",
        type: "other",
        abn: "",
        address: "",
        phone: "",
        email: "",
      });
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create company"));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          New Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add new company</DialogTitle>
            <DialogDescription>
              Add a company to link to your projects
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company-name" className="text-right">
                Name
              </Label>
              <Input
                id="company-name"
                placeholder="Acme Construction"
                className="col-span-3"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company-type" className="text-right">
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {companyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company-abn" className="text-right">
                ABN
              </Label>
              <Input
                id="company-abn"
                placeholder="12 345 678 901"
                className="col-span-3"
                value={formData.abn}
                onChange={(e) =>
                  setFormData({ ...formData, abn: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company-email" className="text-right">
                Email
              </Label>
              <Input
                id="company-email"
                type="email"
                placeholder="contact@example.com"
                className="col-span-3"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="company-phone"
                placeholder="02 1234 5678"
                className="col-span-3"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company-address" className="text-right">
                Address
              </Label>
              <Input
                id="company-address"
                placeholder="123 Main St, Sydney"
                className="col-span-3"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            {error && (
              <p className="col-span-4 text-sm text-destructive">{error}</p>
            )}
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
              {loading ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
