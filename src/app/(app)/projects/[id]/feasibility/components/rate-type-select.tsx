"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RateType } from "@/lib/feasibility/types";

interface RateTypeSelectProps {
  value: RateType;
  onChange: (value: RateType) => void;
  className?: string;
}

const RATE_TYPES: RateType[] = [
  "$ Amount",
  "$/m2",
  "$/Lot",
  "% Construction",
  "% GRV",
];

export function RateTypeSelect({
  value,
  onChange,
  className,
}: RateTypeSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as RateType)}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RATE_TYPES.map((rt) => (
          <SelectItem key={rt} value={rt}>
            {rt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
