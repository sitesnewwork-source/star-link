import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import i18n from "@/i18n";
import { supabase } from "@/integrations/supabase/client";

export const SUPPORTED_COUNTRIES = ["JO", "SA", "AE", "KW", "QA", "BH", "OM", "SY", "IQ", "LB"] as const;
export type CountryCode = (typeof SUPPORTED_COUNTRIES)[number];

export type Currency = "USD" | "JOD" | "EUR" | "SAR" | "AED" | "KWD" | "QAR" | "BHD" | "OMR" | "SYP" | "IQD" | "LBP";

interface CountryInfo {
  code: CountryCode;
  /** Arabic name (matches DB `cities.country` values) */
  nameAr: string;
  /** English name */
  nameEn: string;
  /** Flag emoji */
  flag: string;
  /** Default currency for this country */
  currency: Currency;
  /** International dial prefix */
  dialCode: string;
  /** Map center [lat, lng] */
  center: [number, number];
  /** Default zoom level for map focus */
  zoom: number;
  /** Major cities (Arabic names — primary) */
  cities: string[];
}

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  JO: {
    code: "JO", nameAr: "الأردن", nameEn: "Jordan", flag: "🇯🇴", currency: "JOD", dialCode: "+962",
    center: [31.95, 35.93], zoom: 7,
    cities: ["عمّان", "إربد", "الزرقاء", "العقبة", "السلط", "المفرق", "الكرك", "مأدبا", "جرش", "عجلون", "الطفيلة", "معان"],
  },
  SA: {
    code: "SA", nameAr: "السعودية", nameEn: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", dialCode: "+966",
    center: [24.0, 45.0], zoom: 5,
    cities: ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الطائف", "تبوك", "أبها", "بريدة", "حائل", "الجبيل"],
  },
  AE: {
    code: "AE", nameAr: "الإمارات", nameEn: "UAE", flag: "🇦🇪", currency: "AED", dialCode: "+971",
    center: [24.45, 54.38], zoom: 7,
    cities: ["دبي", "أبوظبي", "الشارقة", "العين", "عجمان", "رأس الخيمة", "الفجيرة", "أم القيوين"],
  },
  KW: {
    code: "KW", nameAr: "الكويت", nameEn: "Kuwait", flag: "🇰🇼", currency: "KWD", dialCode: "+965",
    center: [29.3, 47.7], zoom: 9,
    cities: ["مدينة الكويت", "حولي", "الأحمدي", "الجهراء", "الفروانية", "مبارك الكبير"],
  },
  QA: {
    code: "QA", nameAr: "قطر", nameEn: "Qatar", flag: "🇶🇦", currency: "QAR", dialCode: "+974",
    center: [25.3, 51.2], zoom: 9,
    cities: ["الدوحة", "الريان", "الوكرة", "أم صلال", "الخور", "الشمال"],
  },
  BH: {
    code: "BH", nameAr: "البحرين", nameEn: "Bahrain", flag: "🇧🇭", currency: "BHD", dialCode: "+973",
    center: [26.07, 50.55], zoom: 10,
    cities: ["المنامة", "المحرق", "الرفاع", "حمد", "عيسى", "سترة"],
  },
  OM: {
    code: "OM", nameAr: "عُمان", nameEn: "Oman", flag: "🇴🇲", currency: "OMR", dialCode: "+968",
    center: [21.5, 56.0], zoom: 6,
    cities: ["مسقط", "صلالة", "صحار", "نزوى", "صور", "الرستاق", "إبراء", "البريمي"],
  },
  SY: {
    code: "SY", nameAr: "سوريا", nameEn: "Syria", flag: "🇸🇾", currency: "SYP", dialCode: "+963",
    center: [34.8, 38.9], zoom: 6,
    cities: ["دمشق", "حلب", "حمص", "حماة", "اللاذقية", "طرطوس", "دير الزور", "الحسكة", "الرقة", "إدلب", "درعا", "السويداء", "القنيطرة"],
  },
  IQ: {
    code: "IQ", nameAr: "العراق", nameEn: "Iraq", flag: "🇮🇶", currency: "IQD", dialCode: "+964",
    center: [33.2, 43.7], zoom: 6,
    cities: ["بغداد", "البصرة", "الموصل", "أربيل", "النجف", "كربلاء", "كركوك", "السليمانية", "الناصرية", "الرمادي", "بعقوبة", "الديوانية", "العمارة", "دهوك"],
  },
  LB: {
    code: "LB", nameAr: "لبنان", nameEn: "Lebanon", flag: "🇱🇧", currency: "LBP", dialCode: "+961",
    center: [33.85, 35.86], zoom: 8,
    cities: ["بيروت", "طرابلس", "صيدا", "صور", "زحلة", "جونيه", "بعلبك", "النبطية", "جبيل", "بشري"],
  },
};

const STORAGE_KEY = "sl_country";
const GEO_FLAG = "sl_country_geo";

interface CountryContextValue {
  country: CountryCode;
  info: CountryInfo;
  setCountry: (c: CountryCode) => void;
  /** True until geo detection finishes (or is skipped) */
  detected: boolean;
  /** True while loading cities from DB */
  citiesLoading: boolean;
}

const CountryContext = createContext<CountryContextValue | null>(null);

export const CountryProvider = ({ children }: { children: ReactNode }) => {
  const [country, setCountryState] = useState<CountryCode>(() => {
    if (typeof window === "undefined") return "JO";
    const saved = localStorage.getItem(STORAGE_KEY) as CountryCode | null;
    return saved && SUPPORTED_COUNTRIES.includes(saved) ? saved : "JO";
  });
  const [detected, setDetected] = useState<boolean>(() =>
    typeof window === "undefined"
      ? true
      : !!(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(GEO_FLAG))
  );
  const [citiesByCountry, setCitiesByCountry] = useState<Record<string, string[]>>({});
  const [citiesLoading, setCitiesLoading] = useState(true);

  // Fetch cities from DB once and group by country (Arabic name)
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("name, country, sort_order")
        .order("sort_order", { ascending: true });
      if (!active) return;
      if (error || !data) {
        setCitiesLoading(false);
        return;
      }
      const grouped: Record<string, string[]> = {};
      for (const row of data) {
        const c = (row as any).country as string;
        if (!grouped[c]) grouped[c] = [];
        grouped[c].push((row as any).name as string);
      }
      setCitiesByCountry(grouped);
      setCitiesLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Auto-detect once via IP geolocation
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY) || localStorage.getItem(GEO_FLAG)) return;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    fetch("https://ipapi.co/json/", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const code: string | undefined = (data?.country_code || data?.country)?.toUpperCase();
        const lang: string = SUPPORTED_COUNTRIES.includes(code as CountryCode) ? "ar" : "en";

        if (code && SUPPORTED_COUNTRIES.includes(code as CountryCode)) {
          localStorage.setItem(STORAGE_KEY, code);
          setCountryState(code as CountryCode);
        }
        localStorage.setItem(GEO_FLAG, "1");

        if (!localStorage.getItem("sl_lang")) {
          localStorage.setItem("sl_lang", lang);
          if (i18n.language?.split("-")[0] !== lang) i18n.changeLanguage(lang);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        clearTimeout(timer);
        setDetected(true);
      });
  }, []);

  const setCountry = (c: CountryCode) => {
    localStorage.setItem(STORAGE_KEY, c);
    setCountryState(c);
  };

  const value = useMemo<CountryContextValue>(() => {
    const base = COUNTRIES[country];
    // Override static cities with DB cities when available
    const dbCities = citiesByCountry[base.nameAr];
    const info: CountryInfo = dbCities && dbCities.length > 0 ? { ...base, cities: dbCities } : base;
    return { country, info, setCountry, detected, citiesLoading };
  }, [country, detected, citiesByCountry, citiesLoading]);

  return <CountryContext.Provider value={value}>{children}</CountryContext.Provider>;
};

export const useCountry = () => {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
};
