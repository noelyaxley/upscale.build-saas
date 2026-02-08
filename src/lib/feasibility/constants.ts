import type { DevelopmentType, ProductType } from "./types";

export const DEVELOPMENT_TYPES: { value: DevelopmentType; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "mixed_use", label: "Mixed Use" },
  { value: "industrial", label: "Industrial" },
  { value: "land_subdivision", label: "Land Subdivision" },
];

export const DEVELOPMENT_TYPE_LABELS: Record<DevelopmentType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  mixed_use: "Mixed Use",
  industrial: "Industrial",
  land_subdivision: "Land Subdivision",
};

/** Default sales tabs based on development type */
export const DEFAULT_SALES_TABS: Record<DevelopmentType, { name: string; productType: ProductType }[]> = {
  residential: [{ name: "Residential", productType: "residential" }],
  commercial: [{ name: "Commercial", productType: "commercial" }],
  industrial: [{ name: "Industrial", productType: "industrial" }],
  mixed_use: [
    { name: "Residential", productType: "residential" },
    { name: "Commercial", productType: "commercial" },
  ],
  land_subdivision: [{ name: "Lots", productType: "residential" }],
};
