import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminLoginFallback } from "@/components/admin/AdminLoginFallback";

export const metadata: Metadata = {
  title: "Sign in — Eflin Studio Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
