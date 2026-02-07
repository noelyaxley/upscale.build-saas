"use client";

import { getErrorMessage } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type ContractItem = Tables<"contract_items">;

type Contract = Tables<"contracts"> & {
  company: { id: string; name: string } | null;
};

type Company = {
  id: string;
  name: string;
};

interface CreateClaimViewProps {
  project: { id: string; code: string; name: string };
  contract: Contract;
  items: ContractItem[];
  previouslyClaimed: Record<string, number>;
  companies: Company[];
}

function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface ItemTreeNode {
  item: ContractItem;
  children: ItemTreeNode[];
  depth: number;
}

function buildItemTree(items: ContractItem[]): ItemTreeNode[] {
  const childrenMap = new Map<string | null, ContractItem[]>();
  for (const item of items) {
    const key = item.parent_id;
    if (!childrenMap.has(key)) {
      childrenMap.set(key, []);
    }
    childrenMap.get(key)!.push(item);
  }

  function buildNodes(
    parentId: string | null,
    depth: number
  ): ItemTreeNode[] {
    const children = childrenMap.get(parentId) ?? [];
    return children
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        item,
        children: buildNodes(item.id, depth + 1),
        depth,
      }));
  }

  return buildNodes(null, 0);
}

function flattenTree(tree: ItemTreeNode[]): ItemTreeNode[] {
  const rows: ItemTreeNode[] = [];
  function walk(nodes: ItemTreeNode[]) {
    for (const node of nodes) {
      rows.push(node);
      walk(node.children);
    }
  }
  walk(tree);
  return rows;
}

export function CreateClaimView({
  project,
  contract,
  items,
  previouslyClaimed,
  companies,
}: CreateClaimViewProps) {
  const router = useRouter();
  const { organisation, profile } = useOrganisation();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [submittedByCompanyId, setSubmittedByCompanyId] = useState("");
  const [notes, setNotes] = useState("");

  // Track "this claim" amount per item (in dollars input)
  const [claimAmounts, setClaimAmounts] = useState<Record<string, string>>({});

  const itemTree = buildItemTree(items);
  const flatItems = flattenTree(itemTree);

  const getThisClaimCents = (itemId: string): number => {
    const val = claimAmounts[itemId];
    if (!val) return 0;
    return Math.round(parseFloat(val) * 100);
  };

  const getPreviousClaimed = (itemId: string): number => {
    return previouslyClaimed[itemId] ?? 0;
  };

  // Calculate parent sums recursively
  const getNodeThisClaim = (node: ItemTreeNode): number => {
    if (node.children.length === 0) {
      return getThisClaimCents(node.item.id);
    }
    return node.children.reduce(
      (sum, child) => sum + getNodeThisClaim(child),
      0
    );
  };

  const getNodePreviousClaimed = (node: ItemTreeNode): number => {
    if (node.children.length === 0) {
      return getPreviousClaimed(node.item.id);
    }
    return node.children.reduce(
      (sum, child) => sum + getNodePreviousClaimed(child),
      0
    );
  };

  const getNodeContractValue = (node: ItemTreeNode): number => {
    if (node.children.length === 0) {
      return node.item.contract_value;
    }
    return node.children.reduce(
      (sum, child) => sum + getNodeContractValue(child),
      0
    );
  };

  // Total this claim across all items
  const totalThisClaim = flatItems
    .filter((n) => n.children.length === 0)
    .reduce((sum, n) => sum + getThisClaimCents(n.item.id), 0);

  const totalPrevious = flatItems
    .filter((n) => n.children.length === 0)
    .reduce((sum, n) => sum + getPreviousClaimed(n.item.id), 0);

  const totalContractValue = flatItems
    .filter((n) => n.children.length === 0)
    .reduce((sum, n) => sum + n.item.contract_value, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (totalThisClaim <= 0) {
        throw new Error("Enter at least one line item amount");
      }

      // Create the progress claim
      const { data: claim, error: claimError } = await supabase
        .from("progress_claims")
        .insert({
          org_id: organisation.id,
          project_id: project.id,
          contract_id: contract.id,
          period_start: periodStart,
          period_end: periodEnd,
          claimed_amount: totalThisClaim,
          previous_claims_total: totalPrevious,
          submitted_by_company_id: submittedByCompanyId || null,
          notes: notes || null,
          created_by_user_id: profile.id,
        })
        .select("id")
        .single();

      if (claimError) throw claimError;

      // Batch-insert claim line items for all leaf items
      const lineItems = flatItems
        .filter((n) => n.children.length === 0)
        .map((n, index) => {
          const thisClaim = getThisClaimCents(n.item.id);
          const prevClaimed = getPreviousClaimed(n.item.id);
          const totalClaimed = prevClaimed + thisClaim;
          const pctComplete =
            n.item.contract_value > 0
              ? Math.round(
                  (totalClaimed / n.item.contract_value) * 10000
                ) / 100
              : 0;

          return {
            claim_id: claim.id,
            contract_item_id: n.item.id,
            description: n.item.description,
            contract_value: n.item.contract_value,
            previous_claimed: prevClaimed,
            this_claim: thisClaim,
            total_claimed: totalClaimed,
            percent_complete: pctComplete,
            sort_order: index,
          };
        });

      const { error: lineError } = await supabase
        .from("claim_line_items")
        .insert(lineItems);

      if (lineError) throw lineError;

      router.push(
        `/projects/${project.id}/claims/${contract.id}/${claim.id}`
      );
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create claim"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link
            href={`/projects/${project.id}/claims/${contract.id}`}
          >
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
              href={`/projects/${project.id}/claims`}
              className="hover:underline"
            >
              Progress Claims
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href={`/projects/${project.id}/claims/${contract.id}`}
              className="hover:underline"
            >
              CT-{String(contract.contract_number).padStart(3, "0")}
            </Link>
            <ChevronRight className="size-4" />
            <span>New Claim</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            New Progress Claim
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Period & Company */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Claim Details</CardTitle>
            <CardDescription>
              Claim period and submitting company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="period-start">Period Start</Label>
                <Input
                  id="period-start"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period-end">Period End</Label>
                <Input
                  id="period-end"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submitted-by">Submitted By</Label>
                <Select
                  value={submittedByCompanyId}
                  onValueChange={setSubmittedByCompanyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
            <CardDescription>
              Enter claimed amounts against each schedule item
            </CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No contract items. Add items to the schedule first.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Item</TableHead>
                      <TableHead className="text-right min-w-[120px]">
                        Contract Value
                      </TableHead>
                      <TableHead className="text-right min-w-[130px]">
                        Previously Claimed
                      </TableHead>
                      <TableHead className="text-right min-w-[130px]">
                        This Claim
                      </TableHead>
                      <TableHead className="text-right min-w-[120px]">
                        Total Claimed
                      </TableHead>
                      <TableHead className="text-right min-w-[70px]">
                        %
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flatItems.map((node) => {
                      const isLeaf = node.children.length === 0;
                      const isParent = !isLeaf;
                      const contractValue = isParent
                        ? getNodeContractValue(node)
                        : node.item.contract_value;
                      const prevClaimed = isParent
                        ? getNodePreviousClaimed(node)
                        : getPreviousClaimed(node.item.id);
                      const thisClaim = isParent
                        ? getNodeThisClaim(node)
                        : getThisClaimCents(node.item.id);
                      const totalClaimed = prevClaimed + thisClaim;
                      const pct =
                        contractValue > 0
                          ? (totalClaimed / contractValue) * 100
                          : 0;

                      return (
                        <TableRow
                          key={node.item.id}
                          className={isParent ? "bg-muted/50 font-medium" : ""}
                        >
                          <TableCell>
                            <div
                              style={{
                                paddingLeft: `${node.depth * 1.5}rem`,
                              }}
                            >
                              {node.item.description}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(contractValue)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {prevClaimed > 0
                              ? formatCurrency(prevClaimed)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {isLeaf ? (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="w-28 ml-auto text-right"
                                value={claimAmounts[node.item.id] ?? ""}
                                onChange={(e) =>
                                  setClaimAmounts({
                                    ...claimAmounts,
                                    [node.item.id]: e.target.value,
                                  })
                                }
                              />
                            ) : thisClaim > 0 ? (
                              formatCurrency(thisClaim)
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {totalClaimed > 0
                              ? formatCurrency(totalClaimed)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {pct > 0 ? `${pct.toFixed(0)}%` : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* Totals row */}
                    <TableRow className="font-medium border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalContractValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {totalPrevious > 0
                          ? formatCurrency(totalPrevious)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {totalThisClaim > 0
                          ? formatCurrency(totalThisClaim)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {totalPrevious + totalThisClaim > 0
                          ? formatCurrency(totalPrevious + totalThisClaim)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {totalContractValue > 0
                          ? `${(((totalPrevious + totalThisClaim) / totalContractValue) * 100).toFixed(0)}%`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive mb-4">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link
              href={`/projects/${project.id}/claims/${contract.id}`}
            >
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={loading || items.length === 0}>
            {loading ? "Creating..." : "Create Claim"}
          </Button>
        </div>
      </form>
    </div>
  );
}
