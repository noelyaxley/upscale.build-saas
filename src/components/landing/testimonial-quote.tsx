export function TestimonialQuote() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <blockquote className="text-2xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
            &ldquo;We ran our first feasibility, issued tenders, and processed
            three months of progress claims in the same week we signed up.
            Nothing else in market comes close.&rdquo;
          </blockquote>
          <div className="mt-8">
            <p className="text-lg font-medium">James Mitchell</p>
            <p className="text-sm text-muted-foreground">
              Development Director &middot; Meridian Construct
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
