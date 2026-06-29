import type { CategoryFilter } from "@/types";

export const projectCategories: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "branding", label: "Branding" },
  { id: "editorial", label: "Editorial" },
  { id: "identity", label: "Identity" },
  { id: "digital", label: "Digital" },
  { id: "art-direction", label: "Art Direction" },
];
