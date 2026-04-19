import { useTranslation } from "react-i18next";
import roamHero from "@/assets/roam-hero.jpg";
import AddressForm from "./AddressForm";

const RoamHero = () => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[90vh] flex items-end overflow-hidden">
      <img
        src={roamHero}
        alt={t("roam.heroAlt")}
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1088}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      <div className="relative z-10 container mx-auto px-6 pb-20 md:pb-32">
        <div className="max-w-3xl animate-fade-in-up">
          <p className="text-xs md:text-sm tracking-[0.3em] text-muted-foreground mb-4 uppercase">
            {t("roam.eyebrow")}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-foreground mb-6 leading-tight">
            {t("roam.title1")}
            <br />
            {t("roam.title2")}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
            {t("roam.subtitle")}
          </p>
          <AddressForm plan="roam-local" />
        </div>
      </div>
    </section>
  );
};

export default RoamHero;
