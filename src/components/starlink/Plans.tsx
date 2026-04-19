import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Check, Plug, Activity, CloudRain, Infinity, Calendar } from "lucide-react";
import Price from "./Price";

const Plans = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Plug, label: t("residential.features.plug") },
    { icon: Activity, label: t("residential.features.uptime") },
    { icon: CloudRain, label: t("residential.features.weather") },
    { icon: Infinity, label: t("residential.features.unlimited") },
    { icon: Calendar, label: t("residential.features.trial") },
  ];

  const plans = [
    {
      name: t("residential.plan.liteName"),
      description: t("residential.plan.liteDesc"),
      priceUsd: 25,
      data: t("residential.plan.unlimited"),
    },
    {
      name: t("residential.plan.homesName"),
      description: t("residential.plan.homesDesc"),
      priceUsd: 40,
      data: t("residential.plan.unlimited"),
      featured: true,
    },
  ];

  return (
    <section id="plans" className="relative py-20 md:py-32 bg-background">
      <div className="container">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-light text-center mb-16 md:mb-20 max-w-4xl mx-auto leading-tight">
          {t("residential.plansHeading")}
        </h2>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 md:p-10 border transition-all hover:border-foreground/40 ${
                plan.featured
                  ? "border-foreground/30 bg-card"
                  : "border-border bg-card/50"
              }`}
            >
              <h3 className="text-2xl md:text-3xl font-light mb-3">{plan.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 min-h-[3rem]">
                {plan.description}
              </p>
              <div className="mb-6">
                <Price usd={plan.priceUsd} suffix={t("residential.perMonth")} size="xl" />
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/80 pt-6 border-t border-border">
                <Check className="w-4 h-4" />
                <span>{plan.data}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto mb-12">
          {features.map((f) => (
            <div key={f.label} className="flex flex-col items-center text-center gap-3">
              <f.icon className="w-8 h-8 text-foreground/80" strokeWidth={1.2} />
              <span className="text-xs md:text-sm text-muted-foreground leading-tight">{f.label}</span>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            {t("residential.plansCta")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/service-plans"
              className="h-12 px-8 border border-foreground/80 text-foreground hover:bg-foreground hover:text-background transition-all text-sm font-medium tracking-wider inline-flex items-center justify-center"
            >
              {t("residential.viewAllPlans")}
            </Link>
            <Link
              to="/checkout?plan=residential"
              className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider inline-flex items-center justify-center"
            >
              {t("residential.getStarted")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plans;
