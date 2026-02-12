import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaBanner() {
  return (
    <section className="border-t border-border bg-foreground py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-background sm:text-4xl">
          Ready to build smarter?
        </h2>
        <p className="mx-auto mb-8 max-w-md text-lg text-background/70">
          Join construction teams already managing their projects with
          Upscale.Build. Start free today.
        </p>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="rounded-full"
        >
          <Link href="/signup">
            Get Started Free
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
