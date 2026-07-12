"use client";

import type { ReactNode } from "react";
import type { ResolvedProject } from "@/types";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import type { BookExperienceData } from "@/lib/work/book-pages";
import { CollectionBookIndex } from "@/components/work/CollectionBookIndex";
import { CollectionProjectsIndex } from "@/components/work/CollectionProjectsIndex";

type CollectionExperienceProps = {
  collection: ResolvedWorkCollection;
  projects: ResolvedProject[];
  workPath: string;
  bookData?: BookExperienceData;
  afterGridItems?: ReactNode;
  onBackToCollections?: () => void;
  onProjectOpen?: (slug: string) => void;
};

export function CollectionExperience({
  collection,
  projects,
  workPath,
  bookData,
  afterGridItems,
  onBackToCollections,
  onProjectOpen,
}: CollectionExperienceProps) {
  if (collection.presentationMode === "book" && bookData) {
    return (
      <CollectionBookIndex
        collection={collection}
        projects={projects}
        bookData={bookData}
        workPath={workPath}
        afterGridItems={afterGridItems}
        onBackToCollections={onBackToCollections}
        onProjectOpen={onProjectOpen}
      />
    );
  }

  return (
    <CollectionProjectsIndex
      collection={collection}
      projects={projects}
      workPath={workPath}
      afterGridItems={afterGridItems}
      onBackToCollections={onBackToCollections}
      onProjectOpen={onProjectOpen}
    />
  );
}
