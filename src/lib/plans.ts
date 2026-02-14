export type PlanTier = "free" | "pro" | "ultimate";

export const PLAN_LIMITS: Record<
  PlanTier,
  { maxProjects: number; storageGb: number }
> = {
  free: { maxProjects: 3, storageGb: 1 },
  pro: { maxProjects: Infinity, storageGb: 10 },
  ultimate: { maxProjects: Infinity, storageGb: 1000 },
};
