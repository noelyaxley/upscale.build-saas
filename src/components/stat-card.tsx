import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconClassName?: string;
}

export function StatCard({ icon: Icon, label, value, iconClassName }: StatCardProps) {
  return (
    <Card className="card-hover-lift border-black/[0.08]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className={cn("size-4 text-primary", iconClassName)} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-medium tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
