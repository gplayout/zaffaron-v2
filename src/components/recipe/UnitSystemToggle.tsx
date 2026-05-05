"use client";
/**
 * Unit System Toggle — Phase 6.6 γ (2026-05-05).
 *
 * Provides a button-pair toggle (Metric / Imperial / US) that affects all
 * RecipeIngredients on the page. Persists user pref in cookie.
 *
 * Default behavior: imperial for US visitors (geo-detect via Vercel header
 * `x-vercel-ip-country` set server-side), metric otherwise.
 *
 * Mehdi 2026-05-05 03:16 PDT GO: γ-only (display layer, no schema/backfill).
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { UnitSystem } from "@/lib/units/imperial-convert";

const COOKIE_NAME = "zaff_unit_pref";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface UnitContextValue {
  system: UnitSystem;
  setSystem: (s: UnitSystem) => void;
}

const UnitContext = createContext<UnitContextValue>({ system: "metric", setSystem: () => {} });

export function useUnitSystem() {
  return useContext(UnitContext);
}

export function UnitSystemProvider({ children, initial = "metric" }: { children: ReactNode; initial?: UnitSystem }) {
  const [system, setSystemState] = useState<UnitSystem>(initial);

  // On mount, prefer cookie value over server-rendered initial (client wins for personalization).
  useEffect(() => {
    if (typeof document === "undefined") return;
    const m = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (m) {
      const v = m[1] === "imperial" || m[1] === "metric" ? (m[1] as UnitSystem) : null;
      if (v && v !== system) setSystemState(v);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setSystem = (s: UnitSystem) => {
    setSystemState(s);
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=${s}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    }
  };

  return <UnitContext.Provider value={{ system, setSystem }}>{children}</UnitContext.Provider>;
}

export function UnitSystemToggle({ className = "" }: { className?: string }) {
  const { system, setSystem } = useUnitSystem();
  return (
    <div
      className={`inline-flex rounded-full bg-stone-100 dark:bg-stone-800 p-0.5 text-xs font-medium ${className}`}
      role="group"
      aria-label="Unit system"
    >
      <button
        type="button"
        onClick={() => setSystem("metric")}
        className={`rounded-full px-3 py-1 transition ${
          system === "metric"
            ? "bg-amber-600 text-white shadow-sm"
            : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
        }`}
        aria-pressed={system === "metric"}
      >
        Metric
      </button>
      <button
        type="button"
        onClick={() => setSystem("imperial")}
        className={`rounded-full px-3 py-1 transition ${
          system === "imperial"
            ? "bg-amber-600 text-white shadow-sm"
            : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
        }`}
        aria-pressed={system === "imperial"}
      >
        US (Imperial)
      </button>
    </div>
  );
}
