"use client";

import { SectionIntro } from "./section-intro";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedSection } from "./animated-section";

const faqs = [
  {
    question: "What types of developments does UpScale handle?",
    answer:
      "Dual-occs, townhouses, apartments, commercial, mixed-use — from $500k builds through to $50M+ portfolios. If you're developing property in Australia, UpScale covers the full lifecycle from feasibility to settlement.",
  },
  {
    question: "How is this different from Procore or Aconex?",
    answer:
      "Those platforms are built for Tier 1 builders with enterprise IT budgets. UpScale is built for property developers — the people finding deals, running feasibilities, and managing the money. It's simpler, cheaper, and covers your actual workflow.",
  },
  {
    question: "We're already using spreadsheets. Why switch?",
    answer:
      "Spreadsheets break at scale. One wrong formula and your feasibility is off by six figures. One outdated version and your team is working from the wrong numbers. UpScale gives you the flexibility of a spreadsheet with built-in structure, collaboration, and audit trails. Start with the free tier — it takes 5 minutes to see the difference.",
  },
  {
    question: "Will my team actually use it?",
    answer:
      "That's exactly why we built it simple. No training manuals, no complex setup. If your team can use a spreadsheet, they can use UpScale. And unlike spreadsheets, everyone works from the same source of truth — so there's a reason to use it.",
  },
  {
    question: "Is my project data secure?",
    answer:
      "Encrypted data, role-based access, and full organisation isolation. Each organisation's data is completely separated. Your project financials are safer here than in a Google Sheet someone can forward.",
  },
  {
    question: "What does the free tier include?",
    answer:
      "One project, one team member, feasibility tool, basic cost tracking, and site diary. No credit card required. No time limit. Upgrade to Professional when you need unlimited projects and your full team on board.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={HelpCircle}
          badge="FAQ"
          heading="Got questions?"
          highlightWord="questions"
        />

        <AnimatedSection>
          <div className="overflow-hidden rounded-lg border border-black/[0.08] bg-card">
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
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
