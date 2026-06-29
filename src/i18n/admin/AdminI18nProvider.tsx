"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { adminEn } from "./en";
import { adminTr } from "./tr";
import {
  getInitialAdminLocale,
  persistAdminLocale,
  type AdminLocale,
} from "./storage";
import type { AdminDictionary } from "./types";

type AdminI18nContextValue = {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  t: AdminDictionary;
};

const dictionaries: Record<AdminLocale, AdminDictionary> = {
  en: adminEn,
  tr: adminTr,
};

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);

export function AdminI18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>("tr");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLocaleState(getInitialAdminLocale());
    setReady(true);
  }, []);

  const setLocale = useCallback((next: AdminLocale) => {
    setLocaleState(next);
    persistAdminLocale(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
    }),
    [locale, setLocale],
  );

  if (!ready) {
    return (
      <AdminI18nContext.Provider
        value={{ locale: "tr", setLocale, t: dictionaries.tr }}
      >
        {children}
      </AdminI18nContext.Provider>
    );
  }

  return (
    <AdminI18nContext.Provider value={value}>
      {children}
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n() {
  const ctx = useContext(AdminI18nContext);
  if (!ctx) {
    throw new Error("useAdminI18n must be used within AdminI18nProvider");
  }
  return ctx;
}

export function useAdminT() {
  return useAdminI18n().t;
}

export function useAdminLocale() {
  const { locale, setLocale } = useAdminI18n();
  return { locale, setLocale };
}
