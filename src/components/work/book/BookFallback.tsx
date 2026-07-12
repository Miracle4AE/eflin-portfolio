"use client";

import { Component, type ReactNode } from "react";
import type { ResolvedProject } from "@/types";
import type { ResolvedWorkCollection } from "@/lib/content/collections";
import { CollectionProjectsIndex } from "@/components/work/CollectionProjectsIndex";

type BookFallbackProps = {
  collection: ResolvedWorkCollection;
  projects: ResolvedProject[];
  workPath: string;
  onBackToCollections?: () => void;
  onProjectOpen?: (slug: string) => void;
  afterGridItems?: ReactNode;
  children: ReactNode;
};

type BookFallbackState = {
  hasError: boolean;
};

export class BookFallback extends Component<BookFallbackProps, BookFallbackState> {
  state: BookFallbackState = { hasError: false };

  static getDerivedStateFromError(): BookFallbackState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <CollectionProjectsIndex
          collection={this.props.collection}
          projects={this.props.projects}
          workPath={this.props.workPath}
          onBackToCollections={this.props.onBackToCollections}
          onProjectOpen={this.props.onProjectOpen}
          afterGridItems={this.props.afterGridItems}
        />
      );
    }

    return this.props.children;
  }
}
