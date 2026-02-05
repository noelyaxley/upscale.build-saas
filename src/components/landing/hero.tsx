import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground">
            <Zap className="size-3.5" />
            Now in public beta
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Ship your SaaS{" "}
            <span className="text-muted-foreground">10x faster</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Everything you need to build, launch, and scale your SaaS product.
            Authentication, payments, dashboards — all wired up and ready to go.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">See Features</Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="relative aspect-square w-full max-w-md rounded-2xl border bg-muted/50 p-8">
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-xl bg-primary/10 p-4">
                <Zap className="size-12 text-primary" />
              </div>
              <p className="text-lg font-semibold">Your Product Here</p>
              <p className="text-sm text-muted-foreground">
                Replace this with your product screenshot or illustration
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
