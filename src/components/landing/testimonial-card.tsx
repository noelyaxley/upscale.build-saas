"use client";

import { useState } from "react";
import { SectionIntro } from "./section-intro";
import { MessageSquareQuote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote:
      "Upscale.Build replaced three separate tools for us. Progress claims, site diaries, and budget tracking — all in one place. Our PMs save hours every week.",
    name: "Sarah Chen",
    title: "Operations Manager",
    company: "Atlas Builders",
  },
  {
    quote:
      "The feasibility module alone was worth the switch. We can model scenarios in minutes and present to investors with confidence. It's a game changer.",
    name: "David Park",
    title: "Development Manager",
    company: "Ironbark Projects",
  },
  {
    quote:
      "We onboarded our entire team in a day. The interface is intuitive, the permissions are flexible, and the client portal keeps our stakeholders happy.",
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
          heading="Loved by construction teams"
          highlightWord="Loved"
        />

        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 rounded-xl border border-border bg-card p-8 sm:p-10">
            {/* Avatar */}
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {testimonial.name.charAt(0)}
            </div>

            <blockquote className="mb-6 text-lg leading-relaxed">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>

            <div>
              <p className="font-semibold">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">
                {testimonial.title} &middot; {testimonial.company}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={prev}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <div
                  key={i}
                  className={`size-2 rounded-full transition-colors ${
                    i === current ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={next}
              aria-label="Next testimonial"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
