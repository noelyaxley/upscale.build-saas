"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";

interface CreateLotDialogProps {
  projectId: string;
  children: ReactNode;
}

export function CreateLotDialog({ projectId, children }: CreateLotDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    lotNumber: "",
    bedrooms: "",
    bathrooms: "",
    carSpaces: "",
    level: "",
    internalArea: "",
    externalArea: "",
    aspect: "",
    listPrice: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const internalArea = formData.internalArea
        ? parseFloat(formData.internalArea)
        : null;
      const externalArea = formData.externalArea
        ? parseFloat(formData.externalArea)
        : null;
      const totalArea =
        internalArea || externalArea
          ? (internalArea || 0) + (externalArea || 0)
          : null;

      const { error: insertError } = await supabase.from("lots").insert({
        org_id: organisation.id,
        project_id: projectId,
        lot_number: formData.lotNumber,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        car_spaces: formData.carSpaces ? parseInt(formData.carSpaces) : 0,
        level: formData.level ? parseInt(formData.level) : null,
        internal_area: internalArea,
        external_area: externalArea,
        total_area: totalArea,
        aspect: formData.aspect || null,
        list_price: formData.listPrice
          ? Math.round(parseFloat(formData.listPrice) * 100)
          : 0,
        notes: formData.notes || null,
        created_by_user_id: profile.id,
      });

      if (insertError) throw insertError;

      setOpen(false);
      setFormData({
        lotNumber: "",
        bedrooms: "",
        bathrooms: "",
        carSpaces: "",
        level: "",
        internalArea: "",
        externalArea: "",
        aspect: "",
        listPrice: "",
        notes: "",
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lot");
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
            <DialogTitle>Add Lot</DialogTitle>
            <DialogDescription>
              Add a new lot or unit to this project
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lot-number" className="text-right">
                Lot Number
              </Label>
              <Input
                id="lot-number"
                placeholder="e.g. 101, A-01"
                className="col-span-3"
                value={formData.lotNumber}
                onChange={(e) =>
                  setFormData({ ...formData, lotNumber: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Beds / Bath / Car</Label>
              <div className="col-span-3 grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Beds"
                  value={formData.bedrooms}
                  onChange={(e) =>
                    setFormData({ ...formData, bedrooms: e.target.value })
                  }
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Bath"
                  value={formData.bathrooms}
                  onChange={(e) =>
                    setFormData({ ...formData, bathrooms: e.target.value })
                  }
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Car"
                  value={formData.carSpaces}
                  onChange={(e) =>
                    setFormData({ ...formData, carSpaces: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lot-level" className="text-right">
                Level
              </Label>
              <Input
                id="lot-level"
                type="number"
                placeholder="e.g. 1, 2, 3"
                className="col-span-3"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Area (sqm)</Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Internal"
                  value={formData.internalArea}
                  onChange={(e) =>
                    setFormData({ ...formData, internalArea: e.target.value })
                  }
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="External"
                  value={formData.externalArea}
                  onChange={(e) =>
                    setFormData({ ...formData, externalArea: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lot-aspect" className="text-right">
                Aspect
              </Label>
              <Input
                id="lot-aspect"
                placeholder="e.g. North, NE, Ocean View"
                className="col-span-3"
                value={formData.aspect}
                onChange={(e) =>
                  setFormData({ ...formData, aspect: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lot-price" className="text-right">
                List Price ($)
              </Label>
              <Input
                id="lot-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 750000"
                className="col-span-3"
                value={formData.listPrice}
                onChange={(e) =>
                  setFormData({ ...formData, listPrice: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="lot-notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="lot-notes"
                placeholder="Additional notes..."
                className="col-span-3"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
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
              {loading ? "Creating..." : "Add Lot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
