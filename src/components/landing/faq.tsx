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
    question: "What types of projects does Upscale.Build support?",
    answer:
      "Residential, commercial, civil, and mixed-use developments. The platform covers the full lifecycle — from feasibility analysis and DA through construction, lot sales, and settlement.",
  },
  {
    question: "How do progress claims and variations work?",
    answer:
      "Each contract has its own claim and variation register. Submit claims period by period with line-item breakdowns, track claimed vs certified amounts, and manage variations from draft through to approval with cost and time impact recorded.",
  },
  {
    question: "Can I run development feasibility scenarios?",
    answer:
      "Yes. The feasibility module lets you model land acquisition costs, construction costs with GST, sales revenue by unit type, debt facilities, loans, and equity partners. Compare scenarios side by side and export summaries for investors.",
  },
  {
    question: "How does the Client Portal work?",
    answer:
      "Generate a secure, token-based link for any external stakeholder — investors, consultants, or buyers. They get read-only access to relevant project information without needing an Upscale.Build account. Links can be set to expire.",
  },
  {
    question: "Is my data secure?",
    answer:
      "All data is encrypted at rest and in transit. Row-level security policies ensure each organisation can only access their own data. Every user is scoped to their organisation with role-based permissions (admin or member).",
  },
  {
    question: "Can I manage tenders and contractor procurement?",
    answer:
      "Yes. Create tender packages by trade, collect and compare contractor submissions, evaluate bids, and award — all tracked with a status workflow from draft through to awarded or cancelled.",
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
