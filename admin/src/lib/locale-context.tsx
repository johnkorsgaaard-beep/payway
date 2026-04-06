"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Locale } from "./i18n";

type LocaleCtx = { locale: Locale; setLocale: (l: Locale) => void };

const Ctx = createContext<LocaleCtx>({ locale: "fo", setLocale: () => {} });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setRaw] = useState<Locale>("fo");

  useEffect(() => {
    const saved = localStorage.getItem("payway-lang") as Locale | null;
    if (saved && (saved === "fo" || saved === "da" || saved === "en")) setRaw(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setRaw(l);
    localStorage.setItem("payway-lang", l);
  }, []);

  return <Ctx.Provider value={{ locale, setLocale }}>{children}</Ctx.Provider>;
}

export function useLocale() {
  return useContext(Ctx);
}
