import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { useCountry, COUNTRIES, SUPPORTED_COUNTRIES, CountryCode } from "@/contexts/CountryContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import CountryFlag from "./CountryFlag";

const DISMISS_KEY = "sl_country_banner_dismissed";

const CountryDetectBanner = () => {
  const { t, i18n } = useTranslation();
  const { country, info, setCountry, detected } = useCountry();
  const { currency, symbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!detected) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    // Show only once after geo detection completes
    const timer = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(timer);
  }, [detected]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  };

  const onChange = (c: CountryCode) => {
    setCountry(c);
    setEditing(false);
  };

  if (!open) return null;

  const isAr = i18n.language?.startsWith("ar");
  const countryName = isAr ? info.nameAr : info.nameEn;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:left-auto z-[60] max-w-sm sm:w-96 mx-auto">
      <div className="bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground flex items-center gap-1.5 flex-wrap">
            <span>{t("countryBanner.detected", { defaultValue: "تم اكتشاف بلدك:" })}</span>
            <CountryFlag code={country} className="w-5 h-[15px]" />
            <span className="font-semibold">{countryName}</span>
            <span className="text-muted-foreground">— {currency} {symbol}</span>
          </p>
          {editing ? (
            <select
              autoFocus
              value={country}
              onChange={(e) => onChange(e.target.value as CountryCode)}
              className="mt-2 w-full h-9 bg-background border border-border rounded px-2 text-sm text-foreground"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {COUNTRIES[c].flag}  {isAr ? COUNTRIES[c].nameAr : COUNTRIES[c].nameEn}
                </option>
              ))}
            </select>
          ) : (
            <div className="mt-2 flex items-center gap-3 text-sm">
              <button
                onClick={() => setEditing(true)}
                className="text-primary hover:underline font-medium"
              >
                {t("countryBanner.change", { defaultValue: "تغيير" })}
              </button>
              <button
                onClick={dismiss}
                className="text-muted-foreground hover:text-foreground"
              >
                {t("countryBanner.confirm", { defaultValue: "تأكيد" })}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label={t("countryBanner.close", { defaultValue: "إغلاق" })}
          className="text-muted-foreground hover:text-foreground p-1 -m-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CountryDetectBanner;
