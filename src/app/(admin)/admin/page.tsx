import type { Metadata } from "next";
import { AdminModeSelector } from "@/components/admin/AdminModeSelector";

export const metadata: Metadata = {
  title: "Admin — Eflin Studio",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return <AdminModeSelector />;
}
