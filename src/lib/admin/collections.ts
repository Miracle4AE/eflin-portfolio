import type { ContentCollection, ContentProject, LocaleField } from "@/lib/content/types";
import { ls } from "@/lib/content/locale-field";
import { slugifyProjectTitle } from "@/lib/admin/create-project";

export type CollectionFormValues = {
  id?: string;
  titleTr: string;
  titleEn: string;
  slugTr: string;
  slugEn: string;
  descriptionTr: string;
  descriptionEn: string;
  coverImage?: string;
  featured: boolean;
  seoTitleTr: string;
  seoTitleEn: string;
  seoDescriptionTr: string;
  seoDescriptionEn: string;
};

export type DeleteCollectionStrategy =
  | { type: "delete-empty" }
  | { type: "move-to-other" }
  | { type: "move-to-collection"; targetCollectionId: string }
  | { type: "block" };

export function slugifyCollectionValue(value: string): string {
  return slugifyProjectTitle(value);
}

export function getCollectionFormValues(collection?: ContentCollection): CollectionFormValues {
  return {
    id: collection?.id,
    titleTr: collection?.title.tr ?? "",
    titleEn: collection?.title.en ?? "",
    slugTr: collection?.slug.tr ?? "",
    slugEn: collection?.slug.en ?? "",
    descriptionTr: collection?.description.tr ?? "",
    descriptionEn: collection?.description.en ?? "",
    coverImage: collection?.coverImage ?? "",
    featured: collection?.featured ?? true,
    seoTitleTr: collection?.seo?.title?.tr ?? "",
    seoTitleEn: collection?.seo?.title?.en ?? "",
    seoDescriptionTr: collection?.seo?.description?.tr ?? "",
    seoDescriptionEn: collection?.seo?.description?.en ?? "",
  };
}

export function createCollectionId(slugEn: string, existingIds: string[]): string {
  const used = new Set(existingIds);
  const base = slugifyCollectionValue(slugEn) || "collection";
  if (!used.has(base)) return base;
  let index = 2;
  let candidate = `${base}-${index}`;
  while (used.has(candidate)) {
    index += 1;
    candidate = `${base}-${index}`;
  }
  return candidate;
}

export function getNextCollectionOrder(collections: ContentCollection[]): number {
  const maxOrder = collections.reduce((max, collection) => Math.max(max, collection.order), 0);
  return maxOrder + 10;
}

function optionalLocaleField(en: string, tr: string): LocaleField | undefined {
  if (!en.trim() && !tr.trim()) return undefined;
  return ls(en.trim(), tr.trim());
}

export function collectionFromForm(
  values: CollectionFormValues,
  collections: ContentCollection[],
  existing?: ContentCollection,
): ContentCollection {
  const slugEn = slugifyCollectionValue(values.slugEn || values.titleEn || values.titleTr);
  const slugTr = slugifyCollectionValue(values.slugTr || values.titleTr || values.titleEn);
  const now = new Date().toISOString();
  const seoTitle = optionalLocaleField(values.seoTitleEn, values.seoTitleTr);
  const seoDescription = optionalLocaleField(values.seoDescriptionEn, values.seoDescriptionTr);

  return {
    id: existing?.id ?? createCollectionId(slugEn, collections.map((collection) => collection.id)),
    slug: ls(slugEn, slugTr),
    title: ls(values.titleEn.trim(), values.titleTr.trim()),
    description: ls(values.descriptionEn.trim(), values.descriptionTr.trim()),
    coverImage: values.coverImage?.trim() || undefined,
    order: existing?.order ?? getNextCollectionOrder(collections),
    featured: values.featured,
    seo:
      seoTitle || seoDescription
        ? {
            ...(seoTitle && { title: seoTitle }),
            ...(seoDescription && { description: seoDescription }),
          }
        : undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function getCollectionValidationErrors(
  values: CollectionFormValues,
  collections: ContentCollection[],
  editingId?: string,
): string[] {
  const errors: string[] = [];
  const slugEn = slugifyCollectionValue(values.slugEn || values.titleEn || values.titleTr);
  const slugTr = slugifyCollectionValue(values.slugTr || values.titleTr || values.titleEn);

  if (!values.titleEn.trim() && !values.titleTr.trim()) {
    errors.push("Collection title is required.");
  }
  if (!slugEn) errors.push("English slug is required.");
  if (!slugTr) errors.push("Turkish slug is required.");

  const duplicateEn = collections.some(
    (collection) => collection.id !== editingId && collection.slug.en === slugEn,
  );
  const duplicateTr = collections.some(
    (collection) => collection.id !== editingId && collection.slug.tr === slugTr,
  );
  if (duplicateEn) errors.push("English slug is already used.");
  if (duplicateTr) errors.push("Turkish slug is already used.");

  return errors;
}

export function reorderCollections(
  collections: ContentCollection[],
  fromIndex: number,
  toIndex: number,
): ContentCollection[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return collections;
  const next = [...collections].sort((a, b) => a.order - b.order);
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) return collections;
  next.splice(toIndex, 0, moved);
  return next.map((collection, index) => ({
    ...collection,
    order: (index + 1) * 10,
    updatedAt: new Date().toISOString(),
  }));
}

function buildOtherCollection(order: number): ContentCollection {
  const now = new Date().toISOString();
  return {
    id: "other",
    slug: ls("other", "diger"),
    title: ls("Other", "Diğer"),
    description: ls(
      "Projects that are not assigned to a specific collection.",
      "Belirli bir koleksiyona atanmayan projeler.",
    ),
    order,
    featured: true,
    seo: {
      title: ls("Other", "Diğer"),
      description: ls(
        "Other selected portfolio projects.",
        "Diğer seçili portfolyo projeleri.",
      ),
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function deleteCollectionAndReassignProjects({
  collections,
  projects,
  collectionId,
  strategy,
}: {
  collections: ContentCollection[];
  projects: ContentProject[];
  collectionId: string;
  strategy: DeleteCollectionStrategy;
}): { collections: ContentCollection[]; projects: ContentProject[] } {
  if (strategy.type === "block") {
    return { collections, projects };
  }

  const deletedProjectCount = projects.filter((project) => project.collectionId === collectionId).length;
  const targetFromStrategy =
    strategy.type === "move-to-collection" ? strategy.targetCollectionId : undefined;
  const canDeleteEmpty = deletedProjectCount === 0 && strategy.type === "delete-empty";
  const needsOtherCollection = deletedProjectCount > 0 && strategy.type === "move-to-other";

  let remainingCollections = collections
    .filter((collection) => collection.id !== collectionId)
    .map((collection, index) => ({
      ...collection,
      order: (index + 1) * 10,
    }));

  if (needsOtherCollection && !remainingCollections.some((collection) => collection.id === "other")) {
    remainingCollections = [
      ...remainingCollections,
      buildOtherCollection((remainingCollections.length + 1) * 10),
    ];
  }

  const targetCollectionId = needsOtherCollection ? "other" : targetFromStrategy;
  const targetExists = targetCollectionId
    ? remainingCollections.some((collection) => collection.id === targetCollectionId)
    : false;

  if (remainingCollections.length === 0 || (!canDeleteEmpty && !targetExists)) {
    return { collections, projects };
  }

  return {
    collections: remainingCollections.map((collection, index) => ({
      ...collection,
      order: (index + 1) * 10,
      updatedAt: new Date().toISOString(),
    })),
    projects: projects.map((project) =>
      targetCollectionId && project.collectionId === collectionId
        ? { ...project, collectionId: targetCollectionId }
        : project,
    ),
  };
}
