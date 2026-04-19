import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";

const normalizeLanguage = (value?: string | null) => (value || "ar").split("-")[0];

const applyDocumentDirection = (language: string) => {
  if (typeof document === "undefined") return;

  const normalizedLanguage = normalizeLanguage(language);
  const dir = normalizedLanguage === "ar" ? "rtl" : "ltr";

  document.documentElement.dir = dir;
  document.documentElement.lang = normalizedLanguage;
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", normalizedLanguage);
  document.body?.setAttribute("dir", dir);
};

const DirectionSync = () => {
  const { i18n } = useTranslation();

  useLayoutEffect(() => {
    applyDocumentDirection(i18n.resolvedLanguage || i18n.language);
  }, [i18n.language, i18n.resolvedLanguage]);

  return null;
};

export default DirectionSync;
