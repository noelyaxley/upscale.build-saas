"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Tables } from "@/lib/supabase/database.types";

type Profile = Tables<"profiles">;
type Organisation = Tables<"organisations">;
type Project = Tables<"projects">;

interface OrganisationContextValue {
  profile: Profile;
  organisation: Organisation;
  projects: Project[];
  isAdmin: boolean;
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

  return (
    <OrganisationContext.Provider
      value={{ profile, organisation, projects, isAdmin }}
    >
      {children}
    </OrganisationContext.Provider>
  );
}
