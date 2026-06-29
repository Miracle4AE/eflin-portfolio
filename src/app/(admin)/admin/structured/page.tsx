import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "Structured Editor — Eflin Studio",
  robots: { index: false, follow: false },
};

export default function StructuredAdminPage() {
  return <AdminApp />;
}
