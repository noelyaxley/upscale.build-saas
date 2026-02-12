import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  backHref: string;
  title: string;
  breadcrumbs?: Breadcrumb[];
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ backHref, title, breadcrumbs, badge, children }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href={backHref}>
          <ArrowLeft className="size-4" />
        </Link>
      </Button>
      <div className="flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="size-4" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
          {badge}
        </div>
      </div>
      {children}
    </div>
  );
}
