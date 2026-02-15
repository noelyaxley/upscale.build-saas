import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { glossaryTerms, getTermBySlug } from "@/lib/glossary/terms";

export function generateStaticParams() {
  return glossaryTerms.map((term) => ({ slug: term.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) return {};
  return {
    title: `${term.title} — Property Development Glossary | UpScale.build`,
    description: term.metaDescription,
  };
}

export default async function TermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) notFound();

  const relatedTerms = term.relatedSlugs
    .map((s) => getTermBySlug(s))
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTerm",
        name: term.title,
        description: term.definition,
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: "Property Development Glossary",
          url: "https://upscale.build/learn",
        },
      },
      {
        "@type": "Article",
        headline: term.title,
        description: term.metaDescription,
        author: {
          "@type": "Organization",
          name: "UpScale.build",
          url: "https://upscale.build",
        },
        publisher: {
          "@type": "Organization",
          name: "UpScale.build",
          url: "https://upscale.build",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="py-20 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link
              href="/learn"
              className="transition-colors hover:text-foreground"
            >
              Learn
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{term.title}</span>
          </nav>

          <div className="mx-auto max-w-3xl">
            {/* Title */}
            <h1 className="text-3xl font-medium tracking-tight sm:text-[42px] sm:leading-[1.1]">
              {term.title}
            </h1>

            {/* Category badge */}
            <div className="mt-4 inline-flex rounded-full border border-black/[0.08] px-3 py-1 text-xs font-medium text-muted-foreground">
              {term.category}
            </div>

            {/* Definition callout */}
            <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6">
              <p className="text-base font-medium leading-relaxed">
                {term.definition}
              </p>
            </div>

            {/* Content */}
            <div className="mt-10 space-y-4 text-base leading-relaxed text-muted-foreground">
              {term.content.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* UpScale connection + CTA */}
            <div className="mt-12 rounded-lg border border-black/[0.08] bg-card p-8">
              <h2 className="mb-4 text-lg font-medium">
                How UpScale Handles This
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                {term.upscaleConnection.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-6">
                <Button asChild size="lg" className="rounded-full px-5">
                  <Link href="/signup">
                    Start Free — No Card Required
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Related terms */}
            {relatedTerms.length > 0 && (
              <div className="mt-12">
                <h2 className="mb-4 text-lg font-medium">Related Terms</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedTerms.map((related) =>
                    related ? (
                      <Link
                        key={related.slug}
                        href={`/learn/${related.slug}`}
                        className="card-hover-lift rounded-lg border border-black/[0.08] bg-card p-5 transition-shadow hover:shadow-md"
                      >
                        <h3 className="mb-1.5 font-medium">{related.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {related.definition}
                        </p>
                      </Link>
                    ) : null,
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
