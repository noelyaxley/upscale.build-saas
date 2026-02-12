"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bath,
  Bed,
  Car,
  Home,
  Layers,
  Plus,
} from "lucide-react";
import type { Tables, Database } from "@/lib/supabase/database.types";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateLotDialog } from "@/components/create-lot-dialog";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";

type LotStatus = Database["public"]["Enums"]["lot_status"];

type Lot = Tables<"lots">;

interface LotsViewProps {
  project: { id: string; code: string; name: string };
  lots: Lot[];
  statusFilter: string;
}

const statusColors: Record<LotStatus, string> = {
  available:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  hold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  deposit_paid:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  unconditional:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  settled:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  withdrawn: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const statusLabels: Record<LotStatus, string> = {
  available: "Available",
  hold: "Hold",
  deposit_paid: "Deposit Paid",
  unconditional: "Unconditional",
  settled: "Settled",
  withdrawn: "Withdrawn",
};

function formatCurrency(cents: number | null): string {
  if (cents === null || cents === 0) return "-";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatArea(area: number | null): string {
  if (area === null) return "-";
  return `${area}m²`;
}

export function LotsView({ project, lots, statusFilter }: LotsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/projects/${project.id}/lot-sales?${params.toString()}`);
  };

  // Stats (unfiltered — count all lots)
  const allLots = lots;
  const availableCount = allLots.filter(
    (l) => l.status === "available"
  ).length;
  const soldCount = allLots.filter(
    (l) =>
      l.status === "deposit_paid" ||
      l.status === "unconditional" ||
      l.status === "settled"
  ).length;
  const soldPercent =
    allLots.length > 0 ? Math.round((soldCount / allLots.length) * 100) : 0;
  const totalRevenue = allLots
    .filter(
      (l) =>
        l.status === "deposit_paid" ||
        l.status === "unconditional" ||
        l.status === "settled"
    )
    .reduce((sum, l) => sum + (l.sold_price || l.list_price || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref={`/projects/${project.id}`}
        title={project.name}
        breadcrumbs={[
          { label: project.code, href: `/projects/${project.id}` },
          { label: "Lot Sales" },
        ]}
      >
        <CreateLotDialog projectId={project.id}>
          <Button size="sm">
            <Plus className="mr-2 size-4" />
            Add Lot
          </Button>
        </CreateLotDialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard icon={Home} label="Total Units" value={allLots.length} iconClassName="text-rose-500" />
        <StatCard icon={Home} label="Available" value={availableCount} iconClassName="text-rose-500" />
        <StatCard icon={Home} label="Sold" value={soldCount} iconClassName="text-rose-500" />
        <StatCard icon={Home} label="Sold %" value={`${soldPercent}%`} iconClassName="text-rose-500" />
        <StatCard icon={Home} label="Total Revenue" value={formatCurrency(totalRevenue)} iconClassName="text-rose-500" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lot Inventory</CardTitle>
              <CardDescription>
                {lots.length} lot{lots.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
                <SelectItem value="deposit_paid">Deposit Paid</SelectItem>
                <SelectItem value="unconditional">Unconditional</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {lots.length === 0 ? (
            <EmptyState
              icon={Home}
              title="No lots found"
              description="Add lots to track your property inventory"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lots.map((lot) => (
                <Link
                  key={lot.id}
                  href={`/projects/${project.id}/lot-sales/${lot.id}`}
                  className="group"
                >
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-lg font-bold">
                            {lot.lot_number}
                          </p>
                          {lot.aspect && (
                            <p className="text-sm text-muted-foreground">
                              {lot.aspect}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className={statusColors[lot.status]}
                        >
                          {statusLabels[lot.status]}
                        </Badge>
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                        {(lot.bedrooms ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <Bed className="size-3.5" />
                            {lot.bedrooms}
                          </span>
                        )}
                        {(lot.bathrooms ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <Bath className="size-3.5" />
                            {lot.bathrooms}
                          </span>
                        )}
                        {(lot.car_spaces ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <Car className="size-3.5" />
                            {lot.car_spaces}
                          </span>
                        )}
                        {lot.level !== null && (
                          <span className="flex items-center gap-1">
                            <Layers className="size-3.5" />
                            L{lot.level}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {formatArea(lot.total_area ? Number(lot.total_area) : null)}
                        </span>
                        <span className="text-lg font-bold tabular-nums">
                          {formatCurrency(lot.list_price)}
                        </span>
                      </div>

                      {lot.sold_price && (
                        <div className="mt-1 text-right">
                          <span className="text-sm text-muted-foreground">
                            Sold: {formatCurrency(lot.sold_price)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
