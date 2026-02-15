import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { MidPageCta } from "@/components/landing/mid-page-cta";
import { Personas } from "@/components/landing/personas";
import { Comparison } from "@/components/landing/comparison";
import { FounderStory } from "@/components/landing/founder-story";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <Features />
        <MidPageCta />
        <Personas />
        <Comparison />
        <FounderStory />
        <Pricing />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
