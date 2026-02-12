"use client";

import { SectionIntro } from "./section-intro";
import { HelpCircle } from "lucide-react";
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
  {
    question: "Do you offer onboarding support?",
    answer:
      "Every new organisation gets a guided onboarding session with our team. We help you set up your first project, configure your team, and make sure you are up and running from day one.",
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
          subtitle="Everything you need to know about the platform."
        />

        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
