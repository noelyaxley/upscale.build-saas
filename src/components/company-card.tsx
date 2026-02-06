import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import type { Tables } from "@/lib/supabase/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link href={`/companies/${company.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="truncate text-base">{company.name}</CardTitle>
            <Badge variant="secondary" className={typeColors[company.type] || ""}>
              {formatType(company.type)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {company.abn && (
            <div className="text-sm">
              <span className="text-muted-foreground">ABN: </span>
              <span className="font-mono">{company.abn}</span>
            </div>
          )}
          {company.email && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              <span className="truncate">{company.email}</span>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="size-3.5" />
              <span>{company.phone}</span>
            </div>
          )}
          {!company.abn && !company.email && !company.phone && (
            <p className="text-sm text-muted-foreground">No contact info</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
