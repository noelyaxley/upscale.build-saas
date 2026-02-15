import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getTermsByCategory } from "@/lib/glossary/terms";

export const metadata: Metadata = {
  title: "Property Development Glossary | UpScale.build",
  description:
    "Plain-English explanations of property development and construction terms — feasibility, progress claims, variations, tenders, and more.",
};

const categoryOrder = [
  "Feasibility",
  "Project Delivery",
  "Procurement",
  "Risk & Compliance",
];

export default function LearnPage() {
  const termsByCategory = getTermsByCategory();

  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-[0_0.5px_0.5px_-1.5px_rgba(0,0,0,0.2),0_2px_2px_-3px_rgba(0,0,0,0.08)]">
            <BookOpen className="size-4 text-primary" />
            Learn
          </div>
          <h1 className="text-3xl font-medium tracking-tight sm:text-[42px] sm:leading-[1.1]">
            Property Development{" "}
            <span className="text-primary">Glossary</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            No jargon walls. No textbook definitions. Practical explanations of
            the terms that matter when you&apos;re running a development.
          </p>
        </div>

        <div className="space-y-12">
          {categoryOrder.map((category) => {
            const terms = termsByCategory[category];
            if (!terms) return null;
            return (
              <div key={category}>
                <h2 className="mb-4 text-lg font-medium">{category}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {terms.map((term) => (
                    <Link
                      key={term.slug}
                      href={`/learn/${term.slug}`}
                      className="card-hover-lift rounded-lg border border-black/[0.08] bg-card p-6 transition-shadow hover:shadow-md"
                    >
                      <h3 className="mb-2 font-medium">{term.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {term.definition}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
