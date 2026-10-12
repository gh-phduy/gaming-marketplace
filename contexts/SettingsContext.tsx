"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { useLocale } from "next-intl";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { localeToLanguageCode } from "@/i18n/config";

interface SettingsContextType {
  language: string;
  setLanguage: (lang: string) => void;
  currency: string;
  setCurrency: (curr: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  // The URL locale is authoritative, including when a saved preference differs.
  const language = Object.entries(localeToLanguageCode).find(
    ([, value]) => value === locale,
  )?.[0] || "EN";
  const [currency, setCurrency] = useLocalStorage<string>(
    "app-currency",
    "USD",
  );

  const setLanguage = useCallback(
    (lang: string) => {
      if (typeof window !== "undefined") {
        const locale = localeToLanguageCode[lang] || "en";
        const currentPath = window.location.pathname;
        const currentLocaleMatch = currentPath.match(/^\/([a-z]{2})(?:\/|$)/);
        if (currentLocaleMatch) {
           const newPath = currentPath.replace(`/${currentLocaleMatch[1]}`, `/${locale}`);
           window.location.href = newPath + window.location.search + window.location.hash;
        } else {
           window.location.href = `/${locale}${currentPath}${window.location.search}${window.location.hash}`;
        }
      }
    },
    [],
  );

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
