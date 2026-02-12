"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

interface CounterMetricProps {
  value: string;
  numericPart: number;
  suffix: string;
}

export function CounterMetric({
  value,
  numericPart,
  suffix,
}: CounterMetricProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, numericPart, {
      duration: 1.5,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        setDisplay(
          Number.isInteger(numericPart)
            ? Math.round(latest).toString()
            : latest.toFixed(1)
        );
      },
    });

    return () => controls.stop();
  }, [isInView, numericPart]);

  return (
    <div
      ref={ref}
      className="tabular-nums mb-3 text-[42px] font-medium leading-[1.1] tracking-[-0.02em] text-primary"
    >
      {isInView ? `${display}${suffix}` : value}
    </div>
  );
}
