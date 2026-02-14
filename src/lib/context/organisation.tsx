"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Tables } from "@/lib/supabase/database.types";
import type { PlanTier } from "@/lib/plans";
import { PLAN_LIMITS } from "@/lib/plans";

type Profile = Tables<"profiles">;
type Organisation = Tables<"organisations">;
type Project = Tables<"projects">;

interface OrganisationContextValue {
  profile: Profile;
  organisation: Organisation;
  projects: Project[];
  isAdmin: boolean;
  planTier: PlanTier;
  isPro: boolean;
  isUltimate: boolean;
  canCreateProject: boolean;
}

const OrganisationContext = createContext<OrganisationContextValue | null>(null);

export function useOrganisation() {
  const context = useContext(OrganisationContext);
  if (!context) {
    throw new Error("useOrganisation must be used within an OrganisationProvider");
  }
  return context;
}

interface OrganisationProviderProps {
  children: ReactNode;
  profile: Profile;
  organisation: Organisation;
  projects: Project[];
}

export function OrganisationProvider({
  children,
  profile,
  organisation,
  projects,
}: OrganisationProviderProps) {
  const isAdmin = profile.role === "admin";
  const planTier = ((organisation as any).plan_tier || "free") as PlanTier;
  const isPro = planTier === "pro" || planTier === "ultimate";
  const isUltimate = planTier === "ultimate";
  const canCreateProject = isPro || projects.length < PLAN_LIMITS.free.maxProjects;

  return (
    <OrganisationContext.Provider
      value={{ profile, organisation, projects, isAdmin, planTier, isPro, isUltimate, canCreateProject }}
    >
      {children}
    </OrganisationContext.Provider>
  );
}
