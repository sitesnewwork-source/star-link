import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";
import { useCurrency } from "@/contexts/CurrencyContext";
import Price from "@/components/starlink/Price";

type Audience = "personal" | "business";
type Mobility = "fixed" | "mobile";

const FEATURE_KEYS = ["plug", "uptime", "unlimited", "localOnly", "priority", "vehicles"] as const;
type FeatureKey = (typeof FEATURE_KEYS)[number];

interface PlanDef {
  key: string;
  i18nKey: string;
  /** USD price; undefined for "contact us" plans */
  priceUsd?: number;
  features: Record<FeatureKey, boolean | "standard" | "high">;
}

const PLANS: Record<Audience, Record<Mobility, PlanDef[]>> = {
  personal: {
    fixed: [
      { key: "residential", i18nKey: "residential", priceUsd: 25, features: { plug: true, uptime: true, unlimited: true, localOnly: true, priority: "standard", vehicles: false } },
    ],
    mobile: [
      { key: "roam-local", i18nKey: "roamLocal", priceUsd: 40, features: { plug: true, uptime: true, unlimited: false, localOnly: true, priority: "standard", vehicles: true } },
      { key: "roam-unlimited", i18nKey: "roamUnlimited", priceUsd: 95, features: { plug: true, uptime: true, unlimited: true, localOnly: true, priority: "standard", vehicles: true } },
      { key: "roam-global", i18nKey: "roamGlobal", priceUsd: 200, features: { plug: true, uptime: true, unlimited: true, localOnly: false, priority: "high", vehicles: true } },
    ],
  },
  business: {
    fixed: [
      { key: "biz-fixed", i18nKey: "bizFixed", features: { plug: true, uptime: true, unlimited: true, localOnly: true, priority: "high", vehicles: false } },
    ],
    mobile: [
      { key: "biz-mobile", i18nKey: "bizMobile", features: { plug: true, uptime: true, unlimited: true, localOnly: false, priority: "high", vehicles: true } },
    ],
  },
};

const ServicePlans = () => {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [audience, setAudience] = useState<Audience>("personal");
  const [mobility, setMobility] = useState<Mobility>("fixed");
  const plans = PLANS[audience][mobility];

  const renderToggle = <T extends string>(value: T, options: { v: T; l: string }[], onChange: (v: T) => void) => (
    <div className="inline-flex border border-foreground/20 p-1">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`h-10 px-6 text-sm tracking-wider transition-all ${value === o.v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );

  const renderValue = (v: boolean | "standard" | "high") => {
    if (v === true) return <Check className="w-5 h-5 mx-auto text-foreground" />;
    if (v === false) return <Minus className="w-5 h-5 mx-auto text-muted-foreground/40" />;
    return <span className="text-sm">{v === "high" ? t("servicePlans.priorityHigh") : t("servicePlans.priorityStandard")}</span>;
  };

  const featureLabel = (f: FeatureKey, v: boolean | "standard" | "high") => {
    const label = t(`servicePlans.features.${f}`);
    if (typeof v === "boolean") return `${label}: ${v ? t("servicePlans.yes") : t("servicePlans.no")}`;
    return `${label}: ${v === "high" ? t("servicePlans.priorityHigh") : t("servicePlans.priorityStandard")}`;
  };

  return (
    <>
    <SEO title={seoData.servicePlans.title} description={seoData.servicePlans.description} path="/service-plans" />
    <PageShell
      eyebrow={t("servicePlans.eyebrow")}
      title={t("servicePlans.title")}
      description={t("servicePlans.description")}
    >
      <Breadcrumbs items={[{ label: t("servicePlans.breadcrumb") }]} />
      <section className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
          {renderToggle<Audience>(audience, [{ v: "personal", l: t("servicePlans.audPersonal") }, { v: "business", l: t("servicePlans.audBusiness") }], setAudience)}
          {renderToggle<Mobility>(mobility, [{ v: "fixed", l: t("servicePlans.mobFixed") }, { v: "mobile", l: t("servicePlans.mobMobile") }], setMobility)}
        </div>

        <div className={`grid gap-6 mb-16 ${plans.length === 1 ? "max-w-md mx-auto" : plans.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "md:grid-cols-3"}`}>
          {plans.map((p) => (
            <div key={p.key} className="p-8 border border-foreground/10 hover:border-foreground/30 transition-all flex flex-col">
              <p className="text-xs tracking-wider text-muted-foreground mb-2">{t(`servicePlans.plans.${p.i18nKey}.tagline`)}</p>
              <h3 className="text-2xl font-light mb-3">{t(`servicePlans.plans.${p.i18nKey}.name`)}</h3>
              {p.priceUsd != null ? (
                <div className="mb-6"><Price usd={p.priceUsd} suffix={t("residential.perMonth")} size="md" /></div>
              ) : (
                <p className="text-2xl text-foreground mb-6">{t(`servicePlans.plans.${p.i18nKey}.price`)}</p>
              )}
              <ul className="space-y-2 text-sm text-muted-foreground mb-8 flex-1">
                {FEATURE_KEYS.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-foreground/60" />
                    <span>{featureLabel(f, p.features[f])}</span>
                  </li>
                ))}
              </ul>
              {audience === "personal" ? (
                <Link
                  to={`/checkout?plan=${p.key}`}
                  className="h-11 inline-flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider"
                >
                  {t("servicePlans.ctaStart")}
                </Link>
              ) : (
                <Link
                  to="/business"
                  className="h-11 inline-flex items-center justify-center border border-foreground/60 text-foreground hover:bg-foreground hover:text-background transition-all text-sm font-medium tracking-wider"
                >
                  {t("servicePlans.ctaContact")}
                </Link>
              )}
            </div>
          ))}
        </div>

        {plans.length > 1 && (
          <div className="overflow-x-auto">
            <h2 className="text-2xl font-light mb-6 text-center">{t("servicePlans.compareTitle")}</h2>
            <table className="w-full border border-foreground/10">
              <thead>
                <tr className="border-b border-foreground/10">
                  <th className="text-start p-4 text-sm font-light text-muted-foreground">{t("servicePlans.feature")}</th>
                  {plans.map((p) => (
                    <th key={p.key} className="p-4 text-sm font-light">{t(`servicePlans.plans.${p.i18nKey}.name`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_KEYS.map((f) => (
                  <tr key={f} className="border-b border-foreground/10 last:border-0">
                    <td className="p-4 text-sm text-muted-foreground">{t(`servicePlans.features.${f}`)}</td>
                    {plans.map((p) => (
                      <td key={p.key} className="p-4 text-center">{renderValue(p.features[f])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
    </>
  );
};

export default ServicePlans;
