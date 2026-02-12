"use client";

import { useState } from "react";
import { SectionIntro } from "./section-intro";
import { MessageSquareQuote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote:
      "Our PMs used to spend two days a month reconciling claims in Excel. Now they submit, certify, and track variations in Upscale.Build — it takes an afternoon.",
    name: "Sarah Chen",
    title: "Operations Manager",
    company: "Atlas Builders",
    initials: "SC",
  },
  {
    quote:
      "We model feasibility scenarios with land, debt, equity, and GST in minutes. The board gets a clean summary and we move to the next deal faster.",
    name: "David Park",
    title: "Development Manager",
    company: "Ironbark Projects",
    initials: "DP",
  },
  {
    quote:
      "Site diaries, tender tracking, and the client portal are the three features our team couldn't live without. Everything is in one place, finally.",
    name: "Michelle Torres",
    title: "Project Director",
    company: "Civic Developments",
    initials: "MT",
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
          heading="Teams love delivering with Upscale"
          highlightWord="delivering with"
        />

        <div className="mx-auto max-w-[1000px]">
          <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-card">
            <div className="flex flex-col sm:flex-row">
              {/* Portrait/avatar area */}
              <div className="flex h-48 shrink-0 items-center justify-center bg-muted/50 sm:h-auto sm:w-[340px]">
                <div className="flex size-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-medium text-primary">
                  {testimonial.initials}
                </div>
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
      </div>
    </section>
  );
}
