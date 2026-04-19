import { useTranslation } from "react-i18next";
import AddressForm from "./AddressForm";
import heroImage from "@/assets/hero-dish.jpg";

const Trial = () => {
  const { t } = useTranslation();
  return (
    <section id="trial" className="relative py-24 md:py-32 overflow-hidden">
      <img src={heroImage} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative container text-center max-w-3xl">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-light mb-6 text-shadow-soft">
          {t("residential.trial.title")}
        </h2>
        <p className="text-foreground/90 text-base md:text-lg leading-relaxed mb-12 text-shadow-soft">
          {t("residential.trial.desc")}
        </p>
        <AddressForm />
      </div>
    </section>
  );
};

export default Trial;
