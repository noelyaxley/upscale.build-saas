"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03 },
  },
};

const charVariant = {
  hidden: { opacity: 0, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.4 },
  },
};

export function HeroAnimated() {
  const heading = "Property Development ";
  const highlight = "Made Simple";

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center pb-14 text-center">
      {/* Pill badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2.5 py-1.5 shadow-[0_0.5px_0.5px_-1.5px_rgba(0,0,0,0.2),0_2px_2px_-3px_rgba(0,0,0,0.08)]"
      >
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
          New
        </span>
        <span className="text-sm text-foreground">
          Feasibility & lot sales now live
        </span>
        <Building2 className="size-3.5 text-muted-foreground" />
      </motion.div>

      {/* Character-by-character animated heading */}
      <motion.h1
        className="mb-6 text-4xl font-medium tracking-[-0.02em] leading-[1.05] sm:text-5xl lg:text-[64px]"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {heading.split("").map((char, i) => (
          <motion.span key={i} variants={charVariant}>
            {char}
          </motion.span>
        ))}
        {highlight.split("").map((char, i) => (
          <motion.span
            key={`h-${i}`}
            variants={charVariant}
            className="text-primary"
          >
            {char}
          </motion.span>
        ))}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-8 max-w-[420px] text-base text-muted-foreground"
      >
        One platform to run feasibilities, manage costs, collaborate with your
        team, and deliver projects with confidence — from site acquisition to
        settlement.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex gap-4"
      >
        <Button asChild size="lg" className="rounded-full px-5">
          <Link href="/signup">
            Start Free
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full px-5"
        >
          <Link href="#features">See How It Works</Link>
        </Button>
      </motion.div>
    </div>
  );
}
