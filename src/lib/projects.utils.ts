import type { CategoryFilter, ResolvedProject } from "@/types";

export function filterProjectsByCategory(
  items: ResolvedProject[],
  category: CategoryFilter,
): ResolvedProject[] {
  if (category === "all") return items;
  return items.filter((p) => p.filterCategory === category);
}
