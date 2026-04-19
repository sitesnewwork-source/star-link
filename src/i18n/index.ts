import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

export const SUPPORTED_LANGS = ["ar", "en"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: "ar",
    supportedLngs: SUPPORTED_LANGS as unknown as string[],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "sl_lang",
      caches: ["localStorage"],
    },
  });

const applyDir = (lng: string) => {
  const normalizedLang = (lng || "ar").split("-")[0];
  const dir = normalizedLang === "ar" ? "rtl" : "ltr";
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.dir = dir;
    document.documentElement.setAttribute("lang", normalizedLang);
    document.body?.setAttribute("dir", dir);
  }
};

applyDir(i18n.resolvedLanguage || i18n.language || "ar");
i18n.on("languageChanged", applyDir);
i18n.on("initialized", () => applyDir(i18n.resolvedLanguage || i18n.language || "ar"));

export default i18n;
