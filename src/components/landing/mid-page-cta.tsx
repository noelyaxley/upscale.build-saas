import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function MidPageCta() {
  return (
    <section className="border-t border-border py-14 sm:py-16">
      <div className="mx-auto max-w-[1200px] px-4 text-center sm:px-6 lg:px-8">
        <p className="mb-4 text-lg font-medium">
          Ready to see it in action?
        </p>
        <Button asChild size="lg" className="rounded-full px-5">
          <Link href="/signup">
            Start Your First Project Free
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
