"use client";

import { Building2 } from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
import { useOrganisation } from "@/lib/context/organisation";
import { Card } from "@/components/ui/card";
import { CompanyCard } from "@/components/company-card";
import { CreateCompanyDialog } from "@/components/create-company-dialog";

type Company = Tables<"companies">;

interface CompaniesListProps {
  companies: Company[];
}

export function CompaniesList({ companies }: CompaniesListProps) {
  const { isAdmin } = useOrganisation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage builders, consultants, clients, and other companies
          </p>
        </div>
        <CreateCompanyDialog />
      </div>

      {companies.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <Building2 className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No companies yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Add companies to link them to your projects
          </p>
          {isAdmin && <CreateCompanyDialog />}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}
