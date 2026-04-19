import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import miniImage from "@/assets/starlink-mini.jpg";

const StarlinkMini = () => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[80vh] flex items-end overflow-hidden">
      <img src={miniImage} alt={t("residential.mini.alt")} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative container py-20 md:py-28 text-center">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.2em] mb-6 text-shadow-soft">
          STARLINK MINI
        </h2>
        <p className="text-foreground/90 max-w-3xl mx-auto leading-relaxed mb-8 text-sm md:text-base text-shadow-soft">
          {t("residential.mini.desc")}
        </p>
        <Link to="/specifications" className="inline-block text-sm text-foreground hover:text-muted-foreground transition-colors border-b border-foreground/40 pb-1">
          {t("residential.mini.specsCta")}
        </Link>
      </div>
    </section>
  );
};

export default StarlinkMini;
