"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RollingButtonProps {
  text: string;
  href: string;
}

export function RollingButton({ text, href }: RollingButtonProps) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-background/90"
    >
      <span className="relative overflow-hidden">
        <span className="flex">
          {text.split("").map((char, i) => (
            <span
              key={i}
              className="inline-block transition-transform duration-300 group-hover:-translate-y-full"
              style={{ transitionDelay: `${i * 25}ms` }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
        <span className="absolute left-0 top-0 flex">
          {text.split("").map((char, i) => (
            <span
              key={i}
              className="inline-block translate-y-full transition-transform duration-300 group-hover:translate-y-0"
              style={{ transitionDelay: `${i * 25}ms` }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
      </span>
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
