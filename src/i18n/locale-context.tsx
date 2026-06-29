"use client";



import { createContext, useContext } from "react";

import type { Locale } from "@/i18n/config";

import type { Dictionary } from "@/i18n/types";

import type { SiteConfig } from "@/types";

import { siteConfig as staticSiteConfig } from "@/data/site";



interface LocaleContextValue {

  locale: Locale;

  dictionary: Dictionary;

  siteConfig: SiteConfig;

}



const LocaleContext = createContext<LocaleContextValue | null>(null);



export function LocaleProvider({

  locale,

  dictionary,

  siteConfig = staticSiteConfig,

  children,

}: {

  locale: Locale;

  dictionary: Dictionary;

  siteConfig?: SiteConfig;

  children: React.ReactNode;

}) {

  return (

    <LocaleContext.Provider value={{ locale, dictionary, siteConfig }}>

      {children}

    </LocaleContext.Provider>

  );

}



export function useLocale() {

  const context = useContext(LocaleContext);

  if (!context) {

    throw new Error("useLocale must be used within LocaleProvider");

  }

  return context;

}



export function useDictionary() {

  return useLocale().dictionary;

}



export function useSiteConfig() {

  return useLocale().siteConfig;

}


