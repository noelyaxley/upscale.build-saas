import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="border-t border-border bg-foreground py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-lg border border-white/10 px-8 py-12 sm:px-10 sm:py-14">
          {/* Decorative orange capsules */}
          <div className="absolute -right-8 -top-8 h-24 w-40 rotate-[-20deg] rounded-[100px] bg-primary/20 blur-sm" />
          <div className="absolute -bottom-6 -left-6 h-20 w-32 rotate-[15deg] rounded-[100px] bg-primary/15 blur-sm" />

          <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <h2 className="text-xl font-medium text-background sm:text-2xl">
              Stop managing projects in spreadsheets.
              <br className="hidden sm:block" /> Start delivering with Upscale.Build.
            </h2>
            <Button
              asChild
              variant="secondary"
              className="shrink-0 rounded-full"
            >
              <Link href="/signup">
                Start Free
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
