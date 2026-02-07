"use client";

import { getErrorMessage } from "@/lib/utils";
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

type Agent = { id: string; name: string };

interface CreateSaleDialogProps {
  lotId: string;
  agents: Agent[];
  children: ReactNode;
}

export function CreateSaleDialog({
  lotId,
  agents,
  children,
}: CreateSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    salePrice: "",
    depositAmount: "",
    agentId: "",
    contractDate: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const salePriceCents = Math.round(parseFloat(formData.salePrice) * 100);
      const depositCents = formData.depositAmount
        ? Math.round(parseFloat(formData.depositAmount) * 100)
        : 0;

      // Find agent commission rate to calculate commission
      let commissionAmount = 0;
      if (formData.agentId) {
        const agent = agents.find((a) => a.id === formData.agentId);
        if (agent) {
          const { data: agentData } = await supabase
            .from("sales_agents")
            .select("commission_rate")
            .eq("id", formData.agentId)
            .single();
          if (agentData?.commission_rate) {
            commissionAmount = Math.round(
              salePriceCents * (Number(agentData.commission_rate) / 100)
            );
          }
        }
      }

      const { error: insertError } = await supabase
        .from("sale_transactions")
        .insert({
          lot_id: lotId,
          agent_id: formData.agentId || null,
          buyer_name: formData.buyerName,
          buyer_email: formData.buyerEmail || null,
          buyer_phone: formData.buyerPhone || null,
          sale_price: salePriceCents,
          deposit_amount: depositCents,
          commission_amount: commissionAmount,
          contract_date: formData.contractDate || null,
          notes: formData.notes || null,
        });

      if (insertError) throw insertError;

      // Update lot status and sold_price
      const { error: updateError } = await supabase
        .from("lots")
        .update({
          status: "deposit_paid" as const,
          sold_price: salePriceCents,
        })
        .eq("id", lotId);

      if (updateError) throw updateError;

      setOpen(false);
      setFormData({
        buyerName: "",
        buyerEmail: "",
        buyerPhone: "",
        salePrice: "",
        depositAmount: "",
        agentId: "",
        contractDate: "",
        notes: "",
      });
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to record sale"));
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
            <DialogTitle>Record Sale</DialogTitle>
            <DialogDescription>
              Record a sale transaction for this lot
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sale-buyer" className="text-right">
                Buyer Name
              </Label>
              <Input
                id="sale-buyer"
                placeholder="Full name"
                className="col-span-3"
                value={formData.buyerName}
                onChange={(e) =>
                  setFormData({ ...formData, buyerName: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sale-email" className="text-right">
                Buyer Email
              </Label>
              <Input
                id="sale-email"
                type="email"
                placeholder="buyer@example.com"
                className="col-span-3"
                value={formData.buyerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, buyerEmail: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sale-phone" className="text-right">
                Buyer Phone
              </Label>
              <Input
                id="sale-phone"
                placeholder="Phone number"
                className="col-span-3"
                value={formData.buyerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, buyerPhone: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sale-price" className="text-right">
                Sale Price ($)
              </Label>
              <Input
                id="sale-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 750000"
                className="col-span-3"
                value={formData.salePrice}
                onChange={(e) =>
                  setFormData({ ...formData, salePrice: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sale-deposit" className="text-right">
                Deposit ($)
              </Label>
              <Input
                id="sale-deposit"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 75000"
                className="col-span-3"
                value={formData.depositAmount}
                onChange={(e) =>
                  setFormData({ ...formData, depositAmount: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sale-agent" className="text-right">
                Agent
              </Label>
              <Select
                value={formData.agentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, agentId: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select agent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sale-date" className="text-right">
                Contract Date
              </Label>
              <Input
                id="sale-date"
                type="date"
                className="col-span-3"
                value={formData.contractDate}
                onChange={(e) =>
                  setFormData({ ...formData, contractDate: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="sale-notes" className="text-right pt-2">
                Notes
              </Label>
              <Textarea
                id="sale-notes"
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
              {loading ? "Recording..." : "Record Sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
