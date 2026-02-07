"use client";

import { getErrorMessage } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContractItem = Tables<"contract_items">;

interface EditContractItemDialogProps {
  item: ContractItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditContractItemDialog({
  item,
  open,
  onOpenChange,
}: EditContractItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState(item.description);
  const [contractValue, setContractValue] = useState(
    (item.contract_value / 100).toString()
  );
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setDescription(item.description);
    setContractValue((item.contract_value / 100).toString());
    setError(null);
  }, [open, item.id, item.description, item.contract_value]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const valueCents = contractValue
        ? Math.round(parseFloat(contractValue) * 100)
        : 0;

      const { error: updateError } = await supabase
        .from("contract_items")
        .update({
          description,
          contract_value: valueCents,
        })
        .eq("id", item.id);

      if (updateError) throw updateError;

      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update item"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit item</DialogTitle>
            <DialogDescription>
              Update the schedule item details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-item-desc" className="text-right">
                Description
              </Label>
              <Input
                id="edit-item-desc"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-item-value" className="text-right">
                Value ($)
              </Label>
              <Input
                id="edit-item-value"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="col-span-3"
                value={contractValue}
                onChange={(e) => setContractValue(e.target.value)}
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
