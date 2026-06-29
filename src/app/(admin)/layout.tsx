import { AdminI18nProvider } from "@/i18n/admin/AdminI18nProvider";

export default function AdminRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminI18nProvider>
      <div className="admin-shell min-h-screen bg-background font-body text-foreground">
        {children}
      </div>
    </AdminI18nProvider>
  );
}
