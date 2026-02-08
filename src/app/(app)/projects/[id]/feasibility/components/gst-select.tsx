"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GstStatus } from "@/lib/feasibility/types";

interface GstSelectProps {
  value: GstStatus;
  onChange: (value: GstStatus) => void;
  className?: string;
}

export function GstSelect({ value, onChange, className }: GstSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as GstStatus)}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="exclusive">Ex GST</SelectItem>
        <SelectItem value="inclusive">Inc GST</SelectItem>
        <SelectItem value="exempt">Exempt</SelectItem>
      </SelectContent>
    </Select>
  );
}
