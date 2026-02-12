import type { LucideIcon } from "lucide-react";

interface SectionIntroProps {
  icon: LucideIcon;
  badge: string;
  heading: string;
  highlightWord: string;
  subtitle?: string;
}

export function SectionIntro({
  icon: Icon,
  badge,
  heading,
  highlightWord,
  subtitle,
}: SectionIntroProps) {
  const parts = heading.split(highlightWord);

  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-[0_0.5px_0.5px_-1.5px_rgba(0,0,0,0.2),0_2px_2px_-3px_rgba(0,0,0,0.08)]">
        <Icon className="size-4 text-primary" />
        {badge}
      </div>
      <h2 className="text-3xl font-medium tracking-tight sm:text-[42px] sm:leading-[1.1]">
        {parts[0]}
        <span className="text-primary">{highlightWord}</span>
        {parts[1]}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
