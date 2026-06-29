"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MediaFileType } from "@/lib/admin/media.constants";
import type { MediaFile } from "@/lib/admin/media.types";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

export type MediaPickerFilter = {
  type?: MediaFileType | "all";
  projectSlug?: string | "all";
};

type OpenPickerOptions = {
  filter?: MediaPickerFilter;
  onSelect: (path: string) => void;
};

type MediaPickerContextValue = {
  files: MediaFile[];
  projectSlugs: string[];
  uploadEnabled: boolean;
  loading: boolean;
  refreshMedia: () => Promise<void>;
  openPicker: (options: OpenPickerOptions) => void;
};

const MediaPickerContext = createContext<MediaPickerContextValue | null>(null);

export function MediaPickerProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [projectSlugs, setProjectSlugs] = useState<string[]>([]);
  const [uploadEnabled, setUploadEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerFilter, setPickerFilter] = useState<MediaPickerFilter>({ type: "all", projectSlug: "all" });
  const [onSelect, setOnSelect] = useState<((path: string) => void) | null>(null);

  const refreshMedia = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/media");
      if (!response.ok) return;
      const data = await response.json();
      setFiles(data.files ?? []);
      setProjectSlugs(data.projectSlugs ?? []);
      setUploadEnabled(Boolean(data.uploadEnabled));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMedia();
  }, [refreshMedia]);

  const openPicker = useCallback((options: OpenPickerOptions) => {
    setPickerFilter(options.filter ?? { type: "all", projectSlug: "all" });
    setOnSelect(() => options.onSelect);
    setPickerOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      files,
      projectSlugs,
      uploadEnabled,
      loading,
      refreshMedia,
      openPicker,
    }),
    [files, projectSlugs, uploadEnabled, loading, refreshMedia, openPicker],
  );

  return (
    <MediaPickerContext.Provider value={value}>
      {children}
      <MediaPickerModal
        open={pickerOpen}
        filter={pickerFilter}
        files={files}
        projectSlugs={projectSlugs}
        onClose={() => setPickerOpen(false)}
        onSelect={(path) => {
          onSelect?.(path);
          setPickerOpen(false);
        }}
      />
    </MediaPickerContext.Provider>
  );
}

export function useMediaPicker() {
  const context = useContext(MediaPickerContext);
  if (!context) {
    throw new Error("useMediaPicker must be used within MediaPickerProvider");
  }
  return context;
}
