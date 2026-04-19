import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-space.jpg";
import ProductCard from "./ProductCard";

const HomeHero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <img
        src={heroImage}
        alt={t("home.heroAlt")}
        width={1920}
        height={1280}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 hero-overlay" />

      <div className="relative container flex-1 flex flex-col justify-center pt-32 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light leading-[1.1] text-foreground text-shadow-soft mb-8 animate-fade-in-up">
          {t("home.heroTitle1")}
          <br />
          {t("home.heroTitle2")}
          <br />
          {t("home.heroTitle3")}
        </h1>
        <p className="text-base md:text-lg text-foreground/90 max-w-2xl mx-auto leading-relaxed text-shadow-soft animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          {t("home.heroSubtitle1")}
          <br />
          {t("home.heroSubtitle2")}
        </p>
      </div>

      <div className="relative container pb-12 md:pb-16 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
          <ProductCard
            name={t("home.card.homesName")}
            description={t("home.card.homesDesc")}
            href="/residential"
            plan="residential"
          />
          <ProductCard
            name={t("home.card.roamName")}
            description={t("home.card.roamDesc")}
            priceUsd={40}
            pricePrefix={t("home.card.roamPricePrefix")}
            priceSuffix={t("home.card.roamPriceSuffix")}
            href="/roam"
            plan="roam-local"
          />
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
