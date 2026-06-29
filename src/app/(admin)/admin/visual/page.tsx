import type { Metadata } from "next";
import { VisualEditorApp } from "@/components/admin/visual/VisualEditorApp";

export const metadata: Metadata = {
  title: "Visual Editor — Eflin Studio",
  robots: { index: false, follow: false },
};

export default function VisualAdminPage() {
  return <VisualEditorApp />;
}
