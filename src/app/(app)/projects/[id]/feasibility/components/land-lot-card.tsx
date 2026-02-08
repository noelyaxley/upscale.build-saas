"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { LandLot } from "@/lib/feasibility/types";
import { centsToDisplay, displayToCents, formatCurrency } from "./currency-helpers";

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

interface LandLotCardProps {
  lot: LandLot;
  onUpdate: (changes: Partial<LandLot>) => void;
  onDelete: () => void;
}

export function LandLotCard({ lot, onUpdate, onDelete }: LandLotCardProps) {
  const settlementBalance = (lot.purchase_price || 0) - (lot.deposit_amount || 0);

  const handleDepositPctChange = (val: string) => {
    const pct = parseFloat(val) || 0;
    const depositAmount = Math.round(((lot.purchase_price || 0) * pct) / 100);
    onUpdate({ deposit_pct: pct, deposit_amount: depositAmount });
  };

  const handlePurchasePriceChange = (val: string) => {
    const price = displayToCents(val);
    const depositAmount = Math.round((price * (lot.deposit_pct || 10)) / 100);
    onUpdate({ purchase_price: price, deposit_amount: depositAmount });
  };

  const handleLandRateChange = (val: string) => {
    const rate = displayToCents(val);
    const price = Math.round(rate * (lot.land_size_m2 || 0));
    const depositAmount = Math.round((price * (lot.deposit_pct || 10)) / 100);
    onUpdate({ land_rate: rate, purchase_price: price, deposit_amount: depositAmount });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">{lot.name}</CardTitle>
        <Button variant="ghost" size="icon" className="size-8" onClick={onDelete}>
          <Trash2 className="size-4 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Lot Name</Label>
            <Input
              value={lot.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Land Size (m2)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={lot.land_size_m2 ?? ""}
              onChange={(e) =>
                onUpdate({ land_size_m2: parseFloat(e.target.value) || null })
              }
            />
          </div>
        </div>

        {/* Address */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label className="text-xs">Address</Label>
            <Input
              value={lot.address ?? ""}
              onChange={(e) => onUpdate({ address: e.target.value || null })}
              placeholder="Street address"
            />
          </div>
          <div>
            <Label className="text-xs">Suburb</Label>
            <Input
              value={lot.suburb ?? ""}
              onChange={(e) => onUpdate({ suburb: e.target.value || null })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">State</Label>
              <Select
                value={lot.state ?? "NSW"}
                onValueChange={(v) => onUpdate({ state: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AU_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Postcode</Label>
              <Input
                value={lot.postcode ?? ""}
                onChange={(e) => onUpdate({ postcode: e.target.value || null })}
                maxLength={4}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* GST Options */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            GST Options
          </Label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={lot.entity_gst_registered}
                onChange={(e) =>
                  onUpdate({ entity_gst_registered: e.target.checked })
                }
                className="accent-primary"
              />
              Entity GST Registered
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={lot.land_purchase_gst_included}
                onChange={(e) =>
                  onUpdate({ land_purchase_gst_included: e.target.checked })
                }
                className="accent-primary"
              />
              Purchase Inc GST
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={lot.margin_scheme_applied}
                onChange={(e) =>
                  onUpdate({ margin_scheme_applied: e.target.checked })
                }
                className="accent-primary"
              />
              Margin Scheme
            </label>
          </div>
        </div>

        <Separator />

        {/* Purchase */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Land Rate ($/m2)</Label>
            <Input
              type="number"
              step="1"
              min="0"
              value={centsToDisplay(lot.land_rate)}
              onChange={(e) => handleLandRateChange(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Purchase Price</Label>
            <Input
              type="number"
              step="1"
              min="0"
              value={centsToDisplay(lot.purchase_price)}
              onChange={(e) => handlePurchasePriceChange(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Deposit %</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={lot.deposit_pct}
              onChange={(e) => handleDepositPctChange(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Deposit Amount</Label>
            <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm font-medium">
              {formatCurrency(lot.deposit_amount)}
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs">Settlement Balance</Label>
          <div className="mt-1 rounded-md bg-muted px-3 py-2 text-sm font-medium">
            {formatCurrency(settlementBalance)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
