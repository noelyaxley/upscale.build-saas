"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const quote =
  "We used to run feasibilities in spreadsheets and manage everything from our inbox. Now the whole team works from one platform — and we move faster with more confidence.";

const words = quote.split(" ");

function Word({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  // progress 0→1 spans the full element traversal (~220vh of scroll).
  // Reveal all words between progress 0.0 and 0.25 — words go solid
  // almost immediately as the user scrolls into the section.
  const wordStart = (index / total) * 0.25;
  const wordEnd = wordStart + 0.02;

  const opacity = useTransform(progress, [wordStart, wordEnd], [0.15, 1]);
  const blur = useTransform(progress, [wordStart, wordEnd], [4, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.span style={{ opacity, filter }} className="inline-block mr-[0.3em]">
      {word}
    </motion.span>
  );
}

export function TestimonialQuote() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={containerRef}
      className="border-t border-border"
      style={{ minHeight: "120vh" }}
    >
      <div className="sticky top-[30vh] py-20 sm:py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <blockquote className="text-2xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-[40px]">
              &ldquo;
              {words.map((word, i) => (
                <Word
                  key={i}
                  word={word}
                  index={i}
                  total={words.length}
                  progress={scrollYProgress}
                />
              ))}
              &rdquo;
            </blockquote>
            <div className="mt-8">
              <p className="text-lg font-medium">James Mitchell</p>
              <p className="text-sm text-muted-foreground">
                Development Director &middot; Meridian Construct
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
