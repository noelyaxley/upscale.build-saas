import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "Learn", href: "/learn" },
  { label: "Contact", href: "mailto:hello@upscale.build" },
];

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="flex flex-col justify-between gap-10 border-b border-white/10 py-14 sm:flex-row sm:items-start">
          {/* Left: logo + links */}
          <div>
            <Link
              href="/"
              className="mb-4 flex items-center gap-2 text-lg font-bold"
            >
              <Image src="/logo-64.png" alt="Upscale.Build" width={20} height={20} />
              Upscale.Build
            </Link>
            <nav className="flex flex-wrap gap-4">
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
          </div>

          {/* Right: large logogram */}
          <div className="relative hidden sm:block">
            <Image src="/logo-256.png" alt="" width={200} height={200} className="opacity-[0.04]" />
            {/* Soft glow effect */}
            <div className="absolute inset-0 m-auto size-24 rounded-full bg-white/[0.04] blur-[50px]" />
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          {/* Social icons */}
          <div className="flex items-center gap-4">
            {["X", "Li", "Gh"].map((label) => (
              <div
                key={label}
                className="flex size-6 items-center justify-center text-xs text-background/40"
              >
                {label}
              </div>
            ))}
          </div>

          {/* Legal links */}
          <div className="flex gap-4">
            <Link
              href="#"
              className="text-sm text-background/50 transition-colors hover:text-background"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-background/50 transition-colors hover:text-background"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
