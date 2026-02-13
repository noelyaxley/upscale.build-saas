"use client";

import { DashboardPreview } from "./dashboard-preview";
import { HeroAnimated } from "./hero-animated";
import { PixelTrail } from "@/components/ui/pixel-trail";
import { useScreenSize } from "@/components/hooks/use-screen-size";

export function Hero() {
  const screenSize = useScreenSize();

  return (
    <section className="relative pt-32 sm:pt-40">
      {/* Pixel trail background */}
      <div className="absolute inset-0 z-0">
        <PixelTrail
          pixelSize={screenSize.lessThan("md") ? 48 : 80}
          fadeDuration={0}
          delay={1200}
          pixelClassName="rounded-full bg-primary/20"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Heading area */}
        <div className="pointer-events-none">
          <div className="pointer-events-auto">
            <HeroAnimated />
          </div>
        </div>

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
