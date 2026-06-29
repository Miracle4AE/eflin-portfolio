"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher";
import { useAdminT } from "@/i18n/admin/AdminI18nProvider";

export function AdminLoginForm() {
  const t = useAdminT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((data) => {
        setNotConfigured(data.configured === false);
        if (data.authenticated) {
          router.replace(searchParams.get("next") || "/admin");
        }
      })
      .catch(() => {});
  }, [router, searchParams]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 503) {
        setNotConfigured(true);
        setError(
          typeof data.error === "string" ? data.error : t.login.notConfiguredDetail,
        );
        return;
      }
      setError(t.login.invalidCredentials);
      return;
    }

    const next = searchParams.get("next") || "/admin";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="admin-login-page">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(181,146,141,0.12),transparent_55%)]"
        aria-hidden="true"
      />
      <form onSubmit={handleSubmit} className="admin-login-card">
        <div className="flex items-start justify-between gap-4">
          <p className="text-[10px] uppercase tracking-[0.24em] text-accent">{t.common.brand}</p>
          <AdminLanguageSwitcher />
        </div>
        <h1 className="mt-3 text-3xl font-light text-foreground">{t.login.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t.login.subtitle}</p>

        {notConfigured ? (
          <div className="mt-6 rounded-xl border border-error/30 bg-accent/5 px-4 py-3 text-sm text-error">
            {t.login.notConfiguredDetail}
          </div>
        ) : null}

        <label className="mt-6 block text-xs uppercase tracking-[0.12em] text-muted">
          {t.login.username}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="admin-login-input mt-2"
            autoComplete="username"
            required
            disabled={notConfigured}
          />
        </label>

        <label className="mt-4 block text-xs uppercase tracking-[0.12em] text-muted">
          {t.login.password}
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-login-input pr-12"
              autoComplete="current-password"
              required
              disabled={notConfigured}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-1 text-xs text-muted transition hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
            >
              {showPassword ? t.login.hide : t.login.show}
            </button>
          </div>
        </label>

        {error ? (
          <p className="mt-3 text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || notConfigured}
          className="admin-login-button mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {loading ? t.login.signingIn : t.login.enterEditor}
        </button>

        <Link
          href="/en"
          className="mt-4 block text-center text-sm text-muted transition hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
        >
          {t.login.viewPublicSite}
        </Link>
      </form>
    </div>
  );
}
