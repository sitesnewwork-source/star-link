import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-dish.jpg";
import AddressForm from "./AddressForm";
import Price from "./Price";

const RESIDENTIAL_BASE_USD = 25;

const Hero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      <img
        src={heroImage}
        alt={t("residential.heroAlt")}
        width={1920}
        height={1280}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 hero-overlay" />

      <div className="relative container pt-32 pb-16 md:pb-24 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light leading-[1.1] text-foreground text-shadow-soft mb-8 animate-fade-in-up">
          {t("residential.heroTitle1")}
          <br />
          {t("residential.heroTitle2")}
          <br />
          {t("residential.heroTitle3")}
        </h1>
        <div className="text-base md:text-lg text-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed text-shadow-soft animate-fade-in-up space-y-2" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <p>{t("residential.heroSub1")}</p>
          <p className="flex flex-wrap items-baseline justify-center gap-x-1">
            <span>{t("residential.heroSub2Prefix")}</span>
            <Price usd={RESIDENTIAL_BASE_USD} suffix={t("residential.heroSub2Suffix")} size="md" />
          </p>
          <p>{t("residential.heroSub3")}</p>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <AddressForm />
        </div>
      </div>
    </section>
  );
};

export default Hero;
