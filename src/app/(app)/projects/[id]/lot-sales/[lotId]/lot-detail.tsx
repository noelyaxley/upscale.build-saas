"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  Bed,
  Car,
  ChevronRight,
  DollarSign,
  Home,
  Layers,
  Plus,
  Ruler,
} from "lucide-react";
import type { Tables, Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/client";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateSaleDialog } from "@/components/create-sale-dialog";

type LotStatus = Database["public"]["Enums"]["lot_status"];

type SaleTransaction = Tables<"sale_transactions"> & {
  agent: { id: string; name: string } | null;
};

type Agent = { id: string; name: string };

interface LotDetailProps {
  project: { id: string; code: string; name: string };
  lot: Tables<"lots">;
  transactions: SaleTransaction[];
  agents: Agent[];
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

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Which statuses are valid next transitions
const statusTransitions: Record<LotStatus, LotStatus[]> = {
  available: ["hold", "deposit_paid", "withdrawn"],
  hold: ["available", "deposit_paid", "withdrawn"],
  deposit_paid: ["unconditional", "withdrawn"],
  unconditional: ["settled", "withdrawn"],
  settled: [],
  withdrawn: ["available"],
};

export function LotDetail({
  project,
  lot,
  transactions,
  agents,
}: LotDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("lots")
        .update({ status: newStatus as LotStatus })
        .eq("id", lot.id);
      if (error) throw error;
      router.refresh();
    } finally {
      setUpdating(false);
    }
  };

  const nextStatuses = statusTransitions[lot.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}/lot-sales`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href={`/projects/${project.id}`}
              className="hover:underline"
            >
              {project.code}
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href={`/projects/${project.id}/lot-sales`}
              className="hover:underline"
            >
              Lot Sales
            </Link>
            <ChevronRight className="size-4" />
            <span>Lot {lot.lot_number}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Lot {lot.lot_number}
            </h1>
            <Badge variant="secondary" className={statusColors[lot.status]}>
              {statusLabels[lot.status]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Lot Attributes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="size-5 text-rose-500" />
                Lot Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Bed className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{lot.bedrooms ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Bath className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{lot.bathrooms ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Car className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Car Spaces</p>
                    <p className="font-medium">{lot.car_spaces ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Level</p>
                    <p className="font-medium">
                      {lot.level !== null ? `Level ${lot.level}` : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Ruler className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Internal Area
                    </p>
                    <p className="font-medium">
                      {lot.internal_area
                        ? `${lot.internal_area}m²`
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Ruler className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      External Area
                    </p>
                    <p className="font-medium">
                      {lot.external_area
                        ? `${lot.external_area}m²`
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Ruler className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Area</p>
                    <p className="font-medium">
                      {lot.total_area
                        ? `${lot.total_area}m²`
                        : "-"}
                    </p>
                  </div>
                </div>
                {lot.aspect && (
                  <div className="flex items-center gap-3">
                    <Home className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Aspect</p>
                      <p className="font-medium">{lot.aspect}</p>
                    </div>
                  </div>
                )}
              </div>
              {lot.notes && (
                <div className="mt-4 rounded-md bg-muted/50 p-3">
                  <p className="text-sm whitespace-pre-wrap">{lot.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sale Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sale Transactions</CardTitle>
                  <CardDescription>
                    {transactions.length} transaction
                    {transactions.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                {lot.status !== "settled" && lot.status !== "withdrawn" && (
                  <CreateSaleDialog lotId={lot.id} agents={agents}>
                    <Button size="sm">
                      <Plus className="mr-2 size-4" />
                      Record Sale
                    </Button>
                  </CreateSaleDialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="py-6 text-center">
                  <DollarSign className="mx-auto size-10 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No transactions recorded
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Deposit</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Contract Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tx.buyer_name}</p>
                            {tx.buyer_email && (
                              <p className="text-xs text-muted-foreground">
                                {tx.buyer_email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{tx.agent?.name || "-"}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(tx.sale_price)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(tx.deposit_amount)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(tx.commission_amount)}
                        </TableCell>
                        <TableCell>{formatDate(tx.contract_date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge
                variant="secondary"
                className={`text-base px-3 py-1 ${statusColors[lot.status]}`}
              >
                {statusLabels[lot.status]}
              </Badge>

              {nextStatuses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Change status to:
                  </p>
                  <Select
                    onValueChange={handleStatusChange}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {nextStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusLabels[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="size-4 text-rose-500" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  List Price
                </span>
                <span className="font-bold">
                  {formatCurrency(lot.list_price)}
                </span>
              </div>
              {lot.sold_price && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Sold Price
                  </span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(lot.sold_price)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Record Sale CTA */}
          {lot.status !== "settled" && lot.status !== "withdrawn" && (
            <CreateSaleDialog lotId={lot.id} agents={agents}>
              <Button className="w-full" size="lg">
                <Plus className="mr-2 size-4" />
                Record Sale
              </Button>
            </CreateSaleDialog>
          )}
        </div>
      </div>
    </div>
  );
}
