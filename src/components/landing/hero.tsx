import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";

export function Hero() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-sm font-medium text-primary">
            <Building2 className="size-3.5" />
            Built for construction teams
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Manage Construction Projects{" "}
            <span className="text-primary">with Confidence</span>
          </h1>

          <p className="mb-8 max-w-xl text-lg text-muted-foreground">
            Track progress, control documents, manage budgets, and coordinate
            teams — all in one platform built for the construction industry.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <Link href="#features">See Features</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
