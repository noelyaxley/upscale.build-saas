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
    question: "What types of projects is UpScale built for?",
    answer:
      "Residential, commercial, and mixed-use property developments — from dual-occupancies and townhouses through to large-scale apartment and commercial projects. The platform covers the full lifecycle, from feasibility and site acquisition through to construction, lot sales, and settlement.",
  },
  {
    question: "How does UpScale help me manage project costs?",
    answer:
      "Every project expense is tracked in one place. Submit and certify progress claims each period, manage variations with full cost impact, and see upcoming expenses on a timeline so you can actively manage cash flow. No more chasing invoices or reconciling spreadsheets.",
  },
  {
    question: "Can I test whether a development stacks up financially?",
    answer:
      "Yes. The feasibility tool lets you model land costs, construction costs, sales revenue, debt, and equity — all the core components of a full development feasibility. Run the numbers in minutes so you can move quickly and with confidence as opportunities come up.",
  },
  {
    question: "Can my team and consultants collaborate on the platform?",
    answer:
      "Absolutely. Invite your project managers, site team, and consultants to work from one shared environment. You can also share read-only views with investors or buyers via the Client Portal — they don't need an account to access it.",
  },
  {
    question: "Is my project data secure?",
    answer:
      "Yes. All data is encrypted and each organisation's information is completely separated. Your team members have role-based access, so people only see what's relevant to them. You stay in control of who can view and edit your projects.",
  },
  {
    question: "How does tendering and procurement work?",
    answer:
      "Create tender packages by trade, issue them to contractors, collect and compare submissions, and award — all from one place. It simplifies the procurement process so you can move to contract award with confidence that all the key information has been captured.",
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
          subtitle="Common questions about getting started with UpScale."
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
