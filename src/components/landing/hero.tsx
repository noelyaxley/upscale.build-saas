import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";
import { DashboardPreview } from "./dashboard-preview";

export function Hero() {
  return (
    <section className="pt-32 sm:pt-40">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Heading area */}
        <div className="mx-auto flex max-w-3xl flex-col items-center pb-14 text-center">
          {/* Pill badge with orange "New" inner tag */}
          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2.5 py-1.5 shadow-[0_0.5px_0.5px_-1.5px_rgba(0,0,0,0.2),0_2px_2px_-3px_rgba(0,0,0,0.08)]">
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
              New
            </span>
            <span className="text-sm text-foreground">
              Feasibility & lot sales now live
            </span>
            <Building2 className="size-3.5 text-muted-foreground" />
          </div>

          <h1 className="mb-6 text-4xl font-medium tracking-[-0.02em] leading-[1.05] sm:text-5xl lg:text-[64px]">
            Property Development{" "}
            <span className="text-primary">Made Simple</span>
          </h1>

          <p className="mb-8 max-w-[420px] text-base text-muted-foreground">
            One platform to run feasibilities, manage costs, collaborate with
            your team, and deliver projects with confidence — from site
            acquisition to settlement.
          </p>

          <div className="flex gap-4">
            <Button asChild size="lg" className="rounded-full px-5">
              <Link href="/signup">
                Start Free
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-5"
            >
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>
        </div>

        {/* Dashboard mockup with dot grid background */}
        <div className="relative border-t border-border">
          <div className="dot-grid fade-mask-bottom py-10 sm:py-16">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
