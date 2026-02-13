"use client";

import { useState } from "react";
import Image from "next/image";
import { SectionIntro } from "./section-intro";
import { MessageSquareQuote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./animated-section";

const testimonials = [
  {
    quote:
      "Managing claims and variations used to mean hours in spreadsheets. Now it's all tracked in one system — our contractors submit, we certify, and everyone can see where things are at.",
    name: "Sarah Chen",
    title: "Operations Manager",
    company: "Atlas Builders",
  },
  {
    quote:
      "When a site comes up, we can run a feasibility in minutes and know whether it stacks up. That speed means we don't miss deals while we're still crunching numbers.",
    name: "David Park",
    title: "Development Manager",
    company: "Ironbark Projects",
  },
  {
    quote:
      "Having one place for site diaries, tenders, and project costs has made a real difference. The team actually uses it because it's simple — and that's the whole point.",
    name: "Michelle Torres",
    title: "Project Director",
    company: "Civic Developments",
  },
];

export function TestimonialCard() {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () =>
    setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const testimonial = testimonials[current];

  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={MessageSquareQuote}
          badge="Testimonials"
          heading="Trusted by developers and builders"
          highlightWord="developers and builders"
        />

        <AnimatedSection>
          <div className="mx-auto max-w-[1000px]">
            <div className="card-hover-lift overflow-hidden rounded-lg border border-black/[0.08] bg-card">
              <div className="flex flex-col sm:flex-row">
                {/* Portrait image area */}
                <div className="relative h-48 shrink-0 overflow-hidden bg-muted/50 sm:h-auto sm:w-[340px]">
                  <Image
                    src="/images/landing/testimonial-person.jpg"
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content area */}
                <div className="flex flex-1 flex-col justify-between p-8 sm:p-10">
                  <div>
                    <blockquote className="mb-8 text-lg font-medium leading-[1.1] tracking-[-0.02em] sm:text-2xl">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>

                    <div>
                      <p className="text-lg font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.title} &middot; {testimonial.company}
                      </p>
                    </div>
                  </div>

                  {/* Navigation arrows */}
                  <div className="mt-8 flex items-center gap-2 sm:justify-end">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full border-black/[0.08]"
                      onClick={prev}
                      aria-label="Previous testimonial"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full border-black/[0.08]"
                      onClick={next}
                      aria-label="Next testimonial"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
