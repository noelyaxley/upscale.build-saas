import { DashboardPreview } from "./dashboard-preview";
import { HeroAnimated } from "./hero-animated";

export function Hero() {
  return (
    <section className="pt-32 sm:pt-40">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Heading area */}
        <HeroAnimated />

        {/* Dashboard mockup with grid-line background */}
        <div className="relative border-t border-border">
          <div className="grid-line-bg fade-mask-bottom py-10 sm:py-16">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
