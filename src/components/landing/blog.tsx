import Image from "next/image";
import Link from "next/link";
import { SectionIntro } from "./section-intro";
import { AnimatedSection } from "./animated-section";
import { BookOpen } from "lucide-react";

const posts = [
  {
    image: "/images/landing/blog-trends.png",
    category: "Guide",
    title: "How to run a development feasibility in under 5 minutes",
    date: "Feb 10, 2026",
  },
  {
    image: "/images/landing/blog-security.png",
    category: "Product",
    title: "Introducing the Client Portal — share project updates without the noise",
    date: "Feb 3, 2026",
  },
  {
    image: "/images/landing/blog-onboarding.png",
    category: "Industry",
    title: "Why spreadsheets are costing property developers more than they think",
    date: "Jan 28, 2026",
  },
];

export function Blog() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionIntro
          icon={BookOpen}
          badge="Resources"
          heading="Latest from the blog"
          highlightWord="blog"
        />

        <AnimatedSection>
          <div className="grid gap-6 sm:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.title}
                href="#"
                className="card-hover-lift group flex flex-col overflow-hidden rounded-lg border border-black/[0.08] bg-card"
              >
                <div className="relative h-48 overflow-hidden bg-muted/30">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <span className="mb-2 w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {post.category}
                  </span>
                  <h3 className="mb-3 text-base font-medium leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-auto text-xs text-muted-foreground">
                    {post.date}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
