import { Menu, X, Globe, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavLink } from "@/components/NavLink";
import { useCurrency, SUPPORTED_CURRENCIES } from "@/contexts/CurrencyContext";
import { useCountry, SUPPORTED_COUNTRIES, COUNTRIES } from "@/contexts/CountryContext";
import CountryFlag from "@/components/starlink/CountryFlag";

const LANG_CODES = ["ar", "en"] as const;

const Header = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [bizOpen, setBizOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const close = () => { setOpen(false); setBizOpen(false); setLocaleOpen(false); };
  const location = useLocation();
  const isBusinessActive = location.pathname.startsWith("/business");

  const { country, setCountry } = useCountry();
  const lang = (i18n.language?.split("-")[0] || "ar") as (typeof LANG_CODES)[number];
  const { currency, setCurrency } = useCurrency();

  const setLang = (code: string) => i18n.changeLanguage(code);

  const primaryNav = [
    { label: t("nav.personal"), to: "/" },
    { label: t("nav.homes"), to: "/residential" },
    { label: t("nav.roam"), to: "/roam" },
  ];

  const businessSubNav = [
    { label: t("businessSubNav.fixed"), to: "/business/fixed-site" },
    { label: t("businessSubNav.maritime"), to: "/business/maritime" },
    { label: t("businessSubNav.aviation"), to: "/business/aviation" },
    { label: t("businessSubNav.mobile"), to: "/business/mobile" },
    { label: t("businessSubNav.communityGateway"), to: "/business/community-gateway" },
    { label: t("businessSubNav.privateNetworking"), to: "/business/private-networking" },
    { label: t("businessSubNav.caseStudies"), to: "/business/case-studies" },
  ];

  const secondaryNav = [
    { label: t("nav.resellers"), to: "/resellers" },
    { label: t("nav.support"), to: "/support" },
    { label: t("nav.map"), to: "/map" },
    { label: t("nav.specifications"), to: "/specifications" },
    { label: t("nav.servicePlans"), to: "/service-plans" },
    { label: t("nav.videos"), to: "/videos" },
    { label: t("nav.technology"), to: "/technology" },
    { label: t("nav.updates"), to: "/updates" },
    { label: t("nav.stories"), to: "/stories" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="text-foreground font-bold tracking-[0.3em] text-lg md:text-xl">
          {t("brand")}
        </Link>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setLocaleOpen(!localeOpen)}
              aria-expanded={localeOpen}
              aria-label={`${t("nav.country")} / ${t("nav.language")}`}
              className="text-foreground inline-flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm hover:opacity-70 transition-opacity"
            >
              <CountryFlag code={country} className="w-5 h-[15px]" />
              <span>{country}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${localeOpen ? "rotate-180" : ""}`} />
            </button>
            {localeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLocaleOpen(false)} aria-hidden="true" />
                <div className="absolute end-0 mt-2 w-72 bg-background/95 backdrop-blur-md border border-border shadow-lg z-50 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{t("nav.country")}</p>
                      <ul className="space-y-1 max-h-80 overflow-y-auto pe-1">
                        {SUPPORTED_COUNTRIES.map((code) => (
                          <li key={code}>
                            <button
                              onClick={() => setCountry(code)}
                              className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-foreground/5 transition-colors ${country === code ? "text-primary font-medium" : ""}`}
                            >
                              <span className="flex items-center gap-2">
                                <CountryFlag code={code} className="w-5 h-[15px]" />
                                <span>{t(`countries.${code}`)}</span>
                              </span>
                              {country === code && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{t("nav.language")}</p>
                      <ul className="space-y-1">
                        {LANG_CODES.map((code) => (
                          <li key={code}>
                            <button
                              onClick={() => setLang(code)}
                              className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-foreground/5 transition-colors ${lang === code ? "text-primary font-medium" : ""}`}
                            >
                              <span>{t(`languages.${code}`)}</span>
                              {lang === code && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{t("nav.currency")}</p>
                      <ul className="grid grid-cols-3 gap-1">
                        {SUPPORTED_CURRENCIES.map((code) => (
                          <li key={code}>
                            <button
                              onClick={() => setCurrency(code)}
                              className={`w-full flex items-center justify-center gap-1 px-2 py-1.5 text-sm rounded border transition-colors ${currency === code ? "border-primary text-primary font-medium" : "border-border hover:bg-foreground/5"}`}
                            >
                              <span>{code}</span>
                              {currency === code && <Check className="w-3.5 h-3.5" />}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            className="text-foreground p-2 hover:opacity-70 transition-opacity"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="absolute top-full inset-x-0 bg-background/95 backdrop-blur-md border-t border-border animate-fade-in max-h-[85vh] overflow-y-auto">
          <div className="container py-8 space-y-6">
            <ul className="grid grid-cols-2 gap-3 text-base">
              {primaryNav.map((l) => (
                <li key={l.to}>
                  <NavLink
                    onClick={close}
                    to={l.to}
                    end={l.to === "/"}
                    className="block py-2 border-e-2 border-transparent ps-3 hover:text-muted-foreground transition-colors"
                    activeClassName="!text-primary !border-primary font-semibold"
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
              <li className="col-span-2">
                <button
                  onClick={() => setBizOpen(!bizOpen)}
                  className={`w-full flex items-center justify-between py-2 border-e-2 ps-3 hover:text-muted-foreground transition-colors ${isBusinessActive ? "text-primary border-primary font-semibold" : "border-transparent"}`}
                >
                  <span>{t("nav.business")}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${bizOpen ? "rotate-180" : ""}`} />
                </button>
                {bizOpen && (
                  <ul className="mt-2 me-4 ps-4 border-s border-border space-y-2 animate-fade-in">
                    <li>
                      <NavLink
                        onClick={close}
                        to="/business"
                        end
                        className="block py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        activeClassName="!text-primary font-semibold"
                      >
                        {t("nav.businessOverview")}
                      </NavLink>
                    </li>
                    {businessSubNav.map((l) => (
                      <li key={l.to}>
                        <NavLink
                          onClick={close}
                          to={l.to}
                          className="block py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          activeClassName="!text-primary font-semibold"
                        >
                          {l.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>

            <div className="border-t border-border pt-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {secondaryNav.map((l) => (
                  <li key={l.to}>
                    <NavLink
                      onClick={close}
                      to={l.to}
                      className="block py-1 hover:text-foreground transition-colors"
                      activeClassName="!text-primary font-semibold"
                    >
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
