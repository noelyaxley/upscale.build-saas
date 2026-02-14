import Image from "next/image";
import { Sparkles } from "lucide-react";
import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";

const features = [
  {
    image: "/images/landing/feature-business-solution.png",
    title: "Feasibility in 5 minutes, not 5 days",
    description:
      "A site comes up. You model land, construction, revenue, debt, and equity — and know whether it stacks up before lunch. Move on deals while your competitors are still building spreadsheets.",
  },
  {
    image: "/images/landing/feature-smart-dashboard.png",
    title: "Every dollar tracked. Every claim certified.",
    description:
      "Submit and certify progress claims each period. Track variations with their full cost impact. See exactly how every change hits your budget — so you find out now, not at the next claim.",
  },
  {
    image: "/images/landing/feature-keyboard.png",
    title: "Daily site records that actually protect you",
    description:
      "Weather, labour, equipment, visitors — logged in 2 minutes. When a dispute lands on your desk six months later, you'll have the records to back you up.",
  },
  {
    image: "/images/landing/feature-ai-assistant.png",
    title: "Tenders out, bids in, contracts awarded",
    description:
      "Issue tender packages by trade, collect bids, and compare them side-by-side. Award contracts in days, not weeks — with every submission captured in one place.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={Sparkles}
          badge="Features"
          heading="Not another generic project tool"
          highlightWord="generic"
          subtitle="Every feature is designed around how property developers actually work — not bolted on as an afterthought."
        />

        <AnimatedSection>
          {/* 2-column bento grid with shared borders */}
          <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-card">
            <div className="grid sm:grid-cols-2">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className={`card-hover-lift group flex flex-col gap-6 p-8${
                    i % 2 !== 0 ? " sm:border-l border-black/[0.08]" : ""
                  }${i >= 2 ? " border-t border-black/[0.08]" : ""}`}
                >
                  <div className="flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-muted/30">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={500}
                      height={390}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <h3 className="mb-1.5 text-lg font-medium">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
