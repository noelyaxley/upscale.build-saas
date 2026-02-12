import {
  Building2,
  Hammer,
  HardHat,
  Landmark,
  Warehouse,
  Factory,
} from "lucide-react";

const companies = [
  { name: "Meridian Construct", icon: Building2 },
  { name: "Atlas Builders", icon: Hammer },
  { name: "Ironbark Projects", icon: HardHat },
  { name: "Civic Developments", icon: Landmark },
  { name: "Southern Cross Build", icon: Warehouse },
  { name: "Titan Civil", icon: Factory },
];

export function LogoStrip() {
  return (
    <section className="border-t border-border py-12">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm font-medium text-muted-foreground">
          Trusted by construction companies across Australia
        </p>
        <div className="relative overflow-hidden">
          {/* Gradient masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

          <div className="animate-scroll flex w-max gap-12">
            {/* Duplicated for seamless loop */}
            {[...companies, ...companies].map((company, i) => (
              <div
                key={`${company.name}-${i}`}
                className="flex shrink-0 items-center gap-2.5 text-muted-foreground/60"
              >
                <company.icon className="size-5" />
                <span className="whitespace-nowrap text-sm font-medium">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
