import Image from "next/image";
import { Sparkles } from "lucide-react";
import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";

const features = [
  {
    image: "/images/landing/feature-smart-dashboard.png",
    title: "Progress Claims & Variations",
    description:
      "Know exactly where your money is going. Submit and certify payment claims each period, track variations with full cost impact, and reduce disputes before they start.",
  },
  {
    image: "/images/landing/feature-business-solution.png",
    title: "Feasibility & Lot Sales",
    description:
      "Run the numbers on potential developments in minutes, not days. Model land costs, revenue, debt, and equity so you can move quickly and with confidence as opportunities arise.",
  },
  {
    image: "/images/landing/feature-keyboard.png",
    title: "Site Diary",
    description:
      "Capture what happens on site, every day. Record weather, labour, equipment, visitors, and work summaries in one place — ready when you need it for reporting or disputes.",
  },
  {
    image: "/images/landing/feature-ai-assistant.png",
    title: "Tenders & Procurement",
    description:
      "Simplify contractor procurement from start to finish. Issue packages, collect and compare bids, and award contracts — all captured so nothing falls through the cracks.",
  },
  {
    image: "/images/landing/feature-integration.png",
    title: "Submittals & RFIs",
    description:
      "Keep documentation flowing. Manage shop drawings, product data, and samples through a clear review workflow so your team stays coordinated and approvals don't stall.",
  },
  {
    image: "/images/landing/feature-collaboration.png",
    title: "Programme & EOT",
    description:
      "Stay on top of your programme. Plan schedules with task dependencies, and track extension of time claims so you always know the impact on your delivery dates.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={Sparkles}
          badge="Features"
          heading="Everything in one place"
          highlightWord="one place"
          subtitle="Purpose-built for property development — not a generic project tool with workarounds bolted on."
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
