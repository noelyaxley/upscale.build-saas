"use client";

import { SectionIntro } from "./section-intro";
import { HelpCircle, Building2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is Upscale.Build suitable for small construction firms?",
    answer:
      "Absolutely. We designed the platform to scale from boutique builders managing a handful of projects to large developers running multi-million dollar portfolios. You only pay for what you use.",
  },
  {
    question: "Can I import data from spreadsheets?",
    answer:
      "Yes. You can import project data, budgets, and team lists from CSV and Excel files. Our onboarding team can also help with bulk migration from existing systems.",
  },
  {
    question: "How does role-based access work?",
    answer:
      "Organisation admins can invite team members and assign roles with granular permissions. Control who can view, edit, or approve across projects, budgets, documents, and more.",
  },
  {
    question: "Is my project data secure?",
    answer:
      "Your data is encrypted at rest and in transit. We use Supabase (backed by AWS) with row-level security policies, ensuring each organisation can only access their own data.",
  },
  {
    question: "Can external consultants or clients access the platform?",
    answer:
      "Yes. Our Client Portal feature lets you generate secure, token-based links for external stakeholders. They get read-only access to relevant project information without needing an account.",
  },
  {
    question: "What types of projects does the platform support?",
    answer:
      "Upscale.Build supports residential, commercial, civil, and mixed-use developments. The platform handles everything from site diaries and progress claims to feasibility analysis and lot sales.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={HelpCircle}
          badge="FAQ"
          heading="Frequently asked questions"
          highlightWord="questions"
          subtitle="Get clarity, instantly."
        />

        <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-card">
          <div className="grid sm:grid-cols-[1fr_auto]">
            {/* Accordion column */}
            <div className="p-6 sm:p-8">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border-black/[0.08]"
                  >
                    <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Illustration column */}
            <div className="hidden border-l border-black/[0.08] sm:flex sm:w-[340px] sm:items-center sm:justify-center">
              <div className="dot-grid flex size-full items-center justify-center">
                <Building2 className="size-24 text-primary/15" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
