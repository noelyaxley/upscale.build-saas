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
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-sm font-medium text-primary">
        <Icon className="size-4" />
        {badge}
      </div>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {parts[0]}
        <span className="text-primary">{highlightWord}</span>
        {parts[1]}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
