import Link from "next/link";
import { HardHat } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "mailto:hello@upscale.build" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        {/* Large watermark icon */}
        <div className="mb-12 flex justify-center">
          <HardHat className="size-20 text-background/10" />
        </div>

        {/* Nav links */}
        <nav className="mb-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-background/60 transition-colors hover:text-background"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social icons placeholder */}
        <div className="mb-10 flex items-center justify-center gap-4">
          {["X", "Li", "Gh"].map((label) => (
            <div
              key={label}
              className="flex size-9 items-center justify-center rounded-full border border-background/20 text-xs text-background/40"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
          <p className="text-sm text-background/50">
            &copy; {new Date().getFullYear()} Upscale.Build. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-background/50 transition-colors hover:text-background"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-background/50 transition-colors hover:text-background"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
