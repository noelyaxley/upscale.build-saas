import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { LogoStrip } from "@/components/landing/logo-strip";
import { TestimonialQuote } from "@/components/landing/testimonial-quote";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { Metrics } from "@/components/landing/metrics";
import { Pricing } from "@/components/landing/pricing";
import { Benefits } from "@/components/landing/benefits";
import { Blog } from "@/components/landing/blog";
import { Faq } from "@/components/landing/faq";
import { TestimonialCard } from "@/components/landing/testimonial-card";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <LogoStrip />
        <TestimonialQuote />
        <HowItWorks />
        <Features />
        <Metrics />
        <Pricing />
        <Benefits />
        <Blog />
        <Faq />
        <TestimonialCard />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
