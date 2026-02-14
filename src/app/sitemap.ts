import type { MetadataRoute } from "next";
import { glossaryTerms } from "@/lib/glossary/terms";

const BASE_URL = "https://upscale.build";

export default function sitemap(): MetadataRoute.Sitemap {
  const termPages = glossaryTerms.map((term) => ({
    url: `${BASE_URL}/learn/${term.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/learn`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...termPages,
  ];
}
