"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { joinWaitlist } from "@/app/actions/waitlist";

interface EmailCaptureProps {
  /** Dark background variant (for CTA banner) */
  dark?: boolean;
}

export function EmailCapture({ dark = false }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || isPending) return;

    startTransition(async () => {
      const result = await joinWaitlist(email);
      if (result.success) {
        setState("success");
        setMessage(
          result.alreadyExists
            ? "You're already on the list!"
            : "You're in. We'll be in touch."
        );
        setEmail("");
      } else {
        setState("error");
        setMessage(result.error ?? "Something went wrong.");
      }
    });
  }

  if (state === "success") {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`flex size-5 items-center justify-center rounded-full ${dark ? "bg-primary" : "bg-primary"}`}
        >
          <Check className="size-3 text-white" />
        </div>
        <span
          className={`text-sm font-medium ${dark ? "text-background" : "text-foreground"}`}
        >
          {message}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="you@company.com"
          required
          className={`h-10 rounded-full border px-4 text-sm outline-none transition-colors ${
            dark
              ? "border-white/20 bg-white/10 text-background placeholder:text-background/40 focus:border-primary"
              : "border-black/[0.08] bg-white text-foreground placeholder:text-muted-foreground focus:border-primary"
          } ${state === "error" ? "border-destructive" : ""}`}
        />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              Get Updates
              <ArrowRight className="size-3.5" />
            </>
          )}
        </button>
      </div>
      {state === "error" && (
        <p className="text-xs text-destructive">{message}</p>
      )}
    </form>
  );
}
