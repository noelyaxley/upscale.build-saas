"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  DollarSign,
  FileText,
  Layers,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { EditContractDialog } from "@/components/edit-contract-dialog";
import { EditContractItemDialog } from "@/components/edit-contract-item-dialog";
import { createClient } from "@/lib/supabase/client";
import type { Tables, Database } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ContractStatus = Database["public"]["Enums"]["contract_status"];
type ClaimStatus = Database["public"]["Enums"]["claim_status"];

type Contract = Tables<"contracts"> & {
  company: { id: string; name: string } | null;
  created_by: { id: string; full_name: string | null } | null;
};

type ContractItem = Tables<"contract_items">;

type Claim = Tables<"progress_claims"> & {
  submitted_by_company: { id: string; name: string } | null;
};

type ClaimLineItemSummary = {
  id: string;
  claim_id: string;
  contract_item_id: string | null;
  this_claim: number;
  certified_this_claim: number;
};

type Variation = Tables<"variations"> & {
  submitted_by_company: { id: string; name: string } | null;
};

type Company = {
  id: string;
  name: string;
};

interface ContractDetailProps {
  project: { id: string; code: string; name: string };
  contract: Contract;
  items: ContractItem[];
  claims: Claim[];
  claimLineItems: ClaimLineItemSummary[];
  variations: Variation[];
  companies: Company[];
}

const statusColors: Record<ContractStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  active: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  terminated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusLabels: Record<ContractStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  terminated: "Terminated",
};

const claimStatusColors: Record<ClaimStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  submitted:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  certified:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  paid: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  disputed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const claimStatusLabels: Record<ClaimStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  certified: "Certified",
  paid: "Paid",
  disputed: "Disputed",
};

function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

export function ContractDetail({
  project,
  contract,
  items,
  claims,
  claimLineItems,
  variations,
  companies,
}: ContractDetailProps) {
  const [updating, setUpdating] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addItemLoading, setAddItemLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    description: "",
    contractValue: "",
    parentId: "",
  });
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContractItem | null>(null);
  const router = useRouter();
  const { isAdmin } = useOrganisation();
  const supabase = createClient();

  // Build item tree
  const itemTree = buildItemTree(items);
  const flatItems = flattenTree(itemTree);

  // Calculate claimed-to-date per item
  const claimedByItem = new Map<string, number>();
  const certifiedByItem = new Map<string, number>();
  for (const li of claimLineItems) {
    if (li.contract_item_id) {
      claimedByItem.set(
        li.contract_item_id,
        (claimedByItem.get(li.contract_item_id) ?? 0) + li.this_claim
      );
      certifiedByItem.set(
        li.contract_item_id,
        (certifiedByItem.get(li.contract_item_id) ?? 0) +
          li.certified_this_claim
      );
    }
  }

  // Financial summary
  const totalItemsValue = items.reduce((sum, i) => sum + i.contract_value, 0);
  const variationsValue = variations.reduce(
    (sum, v) => sum + (v.cost_impact ?? 0),
    0
  );
  const adjustedValue = contract.contract_value + variationsValue;
  const totalClaimed = claims.reduce((sum, c) => sum + c.claimed_amount, 0);
  const totalCertified = claims
    .filter((c) => c.status === "certified" || c.status === "paid")
    .reduce((sum, c) => sum + (c.certified_amount || c.claimed_amount), 0);
  const totalPaid = claims
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + (c.certified_amount || c.claimed_amount), 0);
  const remaining = adjustedValue - totalClaimed;

  const handleStatusChange = async (newStatus: ContractStatus) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("contracts")
        .update({ status: newStatus })
        .eq("id", contract.id);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddItemLoading(true);
    try {
      const valueCents = newItem.contractValue
        ? Math.round(parseFloat(newItem.contractValue) * 100)
        : 0;

      const { error } = await supabase.from("contract_items").insert({
        contract_id: contract.id,
        description: newItem.description,
        contract_value: valueCents,
        parent_id: newItem.parentId || null,
        sort_order: items.length,
      });

      if (error) throw error;
      setAddItemOpen(false);
      setNewItem({ description: "", contractValue: "", parentId: "" });
      router.refresh();
    } catch (err) {
      console.error("Failed to add item:", err);
    } finally {
      setAddItemLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string, description: string) => {
    if (!window.confirm(`Delete item "${description}"?`)) return;
    try {
      const { error } = await supabase
        .from("contract_items")
        .delete()
        .eq("id", itemId);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleAddVariationAsItem = async (variation: Variation) => {
    try {
      const { error } = await supabase.from("contract_items").insert({
        contract_id: contract.id,
        description: `V-${String(variation.variation_number).padStart(3, "0")}: ${variation.title}`,
        contract_value: variation.cost_impact ?? 0,
        variation_id: variation.id,
        sort_order: items.length,
      });
      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Failed to add variation as item:", err);
    }
  };

  // Items that are already linked from variations
  const linkedVariationIds = new Set(
    items.filter((i) => i.variation_id).map((i) => i.variation_id)
  );

  const workflowSteps = [
    { key: "draft", label: "Draft", icon: FileText },
    { key: "active", label: "Active", icon: Layers },
    { key: "completed", label: "Completed", icon: CheckCircle },
  ];

  const currentStepIndex = workflowSteps.findIndex(
    (s) => s.key === contract.status
  );

  // Root-level items for parent select
  const rootItems = items.filter((i) => !i.parent_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${project.id}/claims`}>
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
            <span className="font-mono">
              CT-{String(contract.contract_number).padStart(3, "0")}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {contract.name}
          </h1>
        </div>
        <Badge
          variant="secondary"
          className={statusColors[contract.status]}
        >
          {statusLabels[contract.status]}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Contract Details</CardTitle>
                <EditContractDialog contract={contract} companies={companies}>
                  <Button size="sm" variant="ghost">
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>
                </EditContractDialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Building2 className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="text-sm font-medium">
                      {contract.company?.name || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Contract Ref
                    </p>
                    <p className="text-sm font-medium">
                      {contract.contract_ref || "-"}
                    </p>
                  </div>
                </div>
              </div>
              {contract.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {contract.description}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Schedule of Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Schedule of Items
                  </CardTitle>
                  <CardDescription>
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 size-4" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[450px]">
                    <form onSubmit={handleAddItem}>
                      <DialogHeader>
                        <DialogTitle>Add Item</DialogTitle>
                        <DialogDescription>
                          Add a line item to the schedule
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="item-desc"
                            className="text-right"
                          >
                            Description
                          </Label>
                          <Input
                            id="item-desc"
                            placeholder="e.g. Structural Works"
                            className="col-span-3"
                            value={newItem.description}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                description: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="item-value"
                            className="text-right"
                          >
                            Value ($)
                          </Label>
                          <Input
                            id="item-value"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="col-span-3"
                            value={newItem.contractValue}
                            onChange={(e) =>
                              setNewItem({
                                ...newItem,
                                contractValue: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label
                            htmlFor="item-parent"
                            className="text-right"
                          >
                            Parent
                          </Label>
                          <Select
                            value={newItem.parentId}
                            onValueChange={(value) =>
                              setNewItem({
                                ...newItem,
                                parentId: value === "none" ? "" : value,
                              })
                            }
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="None (top-level)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                None (top-level)
                              </SelectItem>
                              {rootItems.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAddItemOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addItemLoading}>
                          {addItemLoading ? "Adding..." : "Add Item"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="mx-auto size-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No items added yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add items to define the schedule of works
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">
                        Contract Value
                      </TableHead>
                      <TableHead className="text-right">
                        Claimed to Date
                      </TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead className="text-right w-[60px]">%</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flatItems.map((node) => {
                      const claimed =
                        claimedByItem.get(node.item.id) ?? 0;
                      const itemRemaining = node.item.contract_value - claimed;
                      const pct =
                        node.item.contract_value > 0
                          ? (claimed / node.item.contract_value) * 100
                          : 0;

                      return (
                        <TableRow key={node.item.id}>
                          <TableCell>
                            <div
                              style={{
                                paddingLeft: `${node.depth * 1.5}rem`,
                              }}
                              className="font-medium"
                            >
                              {node.item.description}
                              {node.item.variation_id && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  Variation
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(node.item.contract_value)}
                          </TableCell>
                          <TableCell className="text-right">
                            {claimed > 0 ? formatCurrency(claimed) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={
                                itemRemaining < 0
                                  ? "text-red-600"
                                  : ""
                              }
                            >
                              {formatCurrency(itemRemaining)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {pct > 0 ? `${pct.toFixed(0)}%` : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingItem(node.item);
                                  setEditItemOpen(true);
                                }}
                              >
                                <Pencil className="size-4" />
                              </Button>
                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() =>
                                    handleDeleteItem(
                                      node.item.id,
                                      node.item.description
                                    )
                                  }
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* Totals */}
                    <TableRow className="font-medium border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalItemsValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {totalClaimed > 0
                          ? formatCurrency(totalClaimed)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(totalItemsValue - totalClaimed)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {totalItemsValue > 0
                          ? `${((totalClaimed / totalItemsValue) * 100).toFixed(0)}%`
                          : "-"}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Approved Variations */}
          {variations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Approved Variations
                </CardTitle>
                <CardDescription>
                  {variations.length} approved variation
                  {variations.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">No.</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="text-right">
                        Cost Impact
                      </TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variations.map((variation) => {
                      const alreadyLinked = linkedVariationIds.has(
                        variation.id
                      );
                      return (
                        <TableRow key={variation.id}>
                          <TableCell className="font-mono text-sm">
                            V-
                            {String(variation.variation_number).padStart(
                              3,
                              "0"
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {variation.title}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(variation.cost_impact ?? 0)}
                          </TableCell>
                          <TableCell>
                            {alreadyLinked ? (
                              <Badge variant="outline" className="text-xs">
                                Added
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleAddVariationAsItem(variation)
                                }
                              >
                                <Plus className="mr-1 size-3" />
                                Add as Item
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Claims */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Progress Claims</CardTitle>
                  <CardDescription>
                    {claims.length} claim{claims.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Button size="sm" asChild>
                  <Link
                    href={`/projects/${project.id}/claims/${contract.id}/new-claim`}
                  >
                    <Plus className="mr-2 size-4" />
                    New Claim
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {claims.length === 0 ? (
                <div className="py-8 text-center">
                  <FileText className="mx-auto size-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No claims yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a progress claim against this contract
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">No.</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead className="text-right">Claimed</TableHead>
                      <TableHead className="text-right">Certified</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell>
                          <Link
                            href={`/projects/${project.id}/claims/${contract.id}/${claim.id}`}
                            className="font-mono text-sm font-medium hover:underline"
                          >
                            PC-
                            {String(claim.claim_number).padStart(3, "0")}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {formatDate(claim.period_start)} -{" "}
                            {formatDate(claim.period_end)}
                          </p>
                        </TableCell>
                        <TableCell>
                          {claim.submitted_by_company?.name || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(claim.claimed_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {claim.certified_amount !== null
                            ? formatCurrency(claim.certified_amount)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={claimStatusColors[claim.status]}
                          >
                            {claimStatusLabels[claim.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Status Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Workflow</CardTitle>
              <CardDescription>
                Manage contract status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contract.status !== "terminated" && (
                <div className="flex items-center justify-center gap-2">
                  {workflowSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.key === contract.status;
                    const isPast = index < currentStepIndex;
                    const isFuture = index > currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        className="flex items-center gap-2"
                      >
                        {index > 0 && (
                          <ArrowRight
                            className={`size-4 ${
                              isPast
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        )}
                        <div
                          className={`flex flex-col items-center gap-1 ${
                            isFuture ? "opacity-50" : ""
                          }`}
                        >
                          <div
                            className={`size-10 rounded-full flex items-center justify-center ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : isPast
                                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-muted"
                            }`}
                          >
                            <Icon className="size-5" />
                          </div>
                          <span className="text-xs">{step.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Separator />

              {contract.status === "draft" && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Activate Contract</p>
                  <p className="text-sm text-muted-foreground">
                    Mark this contract as active to start tracking claims.
                  </p>
                  <Button
                    onClick={() => handleStatusChange("active")}
                    disabled={updating}
                  >
                    <Layers className="mr-2 size-4" />
                    Activate
                  </Button>
                </div>
              )}

              {contract.status === "active" && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Complete Contract</p>
                  <p className="text-sm text-muted-foreground">
                    Mark this contract as completed.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusChange("completed")}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 size-4" />
                      Complete
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to terminate this contract?"
                          )
                        ) {
                          handleStatusChange("terminated");
                        }
                      }}
                      disabled={updating}
                    >
                      Terminate
                    </Button>
                  </div>
                </div>
              )}

              {contract.status === "completed" && (
                <div className="text-center py-4">
                  <CheckCircle className="mx-auto size-8 text-green-500" />
                  <p className="mt-2 text-sm font-medium">
                    Contract Completed
                  </p>
                </div>
              )}

              {contract.status === "terminated" && (
                <div className="text-center py-4">
                  <div className="size-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Trash2 className="size-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-red-600">
                    Contract Terminated
                  </p>
                </div>
              )}

              {(contract.status === "completed" ||
                contract.status === "terminated") &&
                isAdmin && (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange("draft")}
                      disabled={updating}
                    >
                      Reopen as Draft
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Contract Value
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(contract.contract_value)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Variations</p>
                  <p className="text-sm font-medium">
                    {variationsValue !== 0
                      ? formatCurrency(variationsValue)
                      : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Adjusted Value
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(adjustedValue)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Claimed
                  </p>
                  <p className="text-sm font-medium">
                    {totalClaimed > 0 ? formatCurrency(totalClaimed) : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Certified
                  </p>
                  <p className="text-sm font-medium">
                    {totalCertified > 0
                      ? formatCurrency(totalCertified)
                      : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="text-sm font-medium">
                    {totalPaid > 0 ? formatCurrency(totalPaid) : "-"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <DollarSign className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p
                    className={`text-lg font-bold ${
                      remaining < 0
                        ? "text-red-600"
                        : remaining > 0
                          ? "text-green-600"
                          : ""
                    }`}
                  >
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {formatDate(contract.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {formatDate(contract.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {editingItem && (
        <EditContractItemDialog
          item={editingItem}
          open={editItemOpen}
          onOpenChange={setEditItemOpen}
        />
      )}
    </div>
  );
}
