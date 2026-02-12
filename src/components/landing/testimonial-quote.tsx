import { Quote } from "lucide-react";

export function TestimonialQuote() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Quote className="mx-auto mb-6 size-10 text-primary/30" />
          <blockquote className="text-xl font-medium leading-relaxed tracking-tight sm:text-2xl">
            &ldquo;We moved from spreadsheets to Upscale.Build mid-project and
            haven&apos;t looked back. Budget tracking alone saved us hundreds of
            hours across the portfolio.&rdquo;
          </blockquote>
          <div className="mt-8">
            <p className="font-semibold">James Mitchell</p>
            <p className="text-sm text-muted-foreground">
              Development Director &middot; Meridian Construct
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
