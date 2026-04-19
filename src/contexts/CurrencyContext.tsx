import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useCountry, type Currency as CountryCurrency } from "./CountryContext";

export const SUPPORTED_CURRENCIES = ["USD", "JOD", "EUR", "SAR", "AED", "KWD", "QAR", "BHD", "OMR", "SYP", "IQD", "LBP"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

// Static USD-base exchange rates. Update as needed (or fetch from an API later).
const RATES: Record<Currency, number> = {
  USD: 1,
  JOD: 0.71,
  EUR: 0.92,
  SAR: 3.75,
  AED: 3.67,
  KWD: 0.31,
  QAR: 3.64,
  BHD: 0.38,
  OMR: 0.39,
  SYP: 13000,
  IQD: 1310,
  LBP: 89500,
};

const SYMBOL: Record<Currency, string> = {
  USD: "$",
  JOD: "د.أ",
  EUR: "€",
  SAR: "ر.س",
  AED: "د.إ",
  KWD: "د.ك",
  QAR: "ر.ق",
  BHD: "د.ب",
  OMR: "ر.ع",
  SYP: "ل.س",
  IQD: "د.ع",
  LBP: "ل.ل",
};

const STORAGE_KEY = "sl_currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Convert a USD amount to the active currency (with discount applied). */
  convert: (usd: number) => number;
  /** Format a USD amount as a localized price string with symbol (with discount applied). */
  format: (usd: number, opts?: { suffix?: string }) => string;
  /** Format the original (pre-discount) USD amount. */
  formatOriginal: (usd: number, opts?: { suffix?: string }) => string;
  /** Active discount percentage (e.g. 50). 0 means no discount. */
  discountPercent: number;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { country, info, detected } = useCountry();

  // Global policy: USD only for all countries, with a 50% discount applied to every price.
  const currency: Currency = "USD";
  const DISCOUNT = 0.5;

  const setCurrency = (_c: Currency) => {
    // No-op: pricing is locked to USD across all regions.
  };

  const value = useMemo<CurrencyContextValue>(() => {
    const convert = (usd: number) => usd * DISCOUNT * RATES[currency];
    const fmt = (v: number, suffix: string) =>
      `${SYMBOL[currency]} ${v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${suffix}`;
    const format = (usd: number, opts?: { suffix?: string }) =>
      fmt(convert(usd), opts?.suffix ?? "");
    const formatOriginal = (usd: number, opts?: { suffix?: string }) =>
      fmt(usd * RATES[currency], opts?.suffix ?? "");
    return {
      currency,
      setCurrency,
      convert,
      format,
      formatOriginal,
      discountPercent: Math.round((1 - DISCOUNT) * 100),
      symbol: SYMBOL[currency],
    };
  }, []);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};

export type { CountryCurrency };
