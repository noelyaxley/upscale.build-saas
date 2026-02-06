"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
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
import { Separator } from "@/components/ui/separator";
import { EditCompanyDialog } from "@/components/edit-company-dialog";
import { DeleteCompanyDialog } from "@/components/delete-company-dialog";

type Company = Tables<"companies">;

const typeColors: Record<string, string> = {
  builder: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  consultant: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  client: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  subcontractor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  supplier: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

interface CompanyDetailProps {
  company: Company;
}

export function CompanyDetail({ company }: CompanyDetailProps) {
  const { isAdmin } = useOrganisation();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/companies">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={typeColors[company.type]}>
              {formatType(company.type)}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <EditCompanyDialog company={company}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
            </EditCompanyDialog>
            <DeleteCompanyDialog company={company}>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </DeleteCompanyDialog>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-muted-foreground" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ABN</span>
              <span className="font-mono">{company.abn || "-"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Type</span>
              <span>{formatType(company.type)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4 text-muted-foreground" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              <span>{company.email || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="size-4 text-muted-foreground" />
              <span>{company.phone || "-"}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 text-muted-foreground" />
              <span>{company.address || "-"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Linked Projects</CardTitle>
          <CardDescription>
            Projects associated with this company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Project linking will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
