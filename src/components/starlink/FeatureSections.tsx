import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import earthImage from "@/assets/earth-satellites.jpg";
import nightSky from "@/assets/night-sky.jpg";
import kit from "@/assets/starlink-kit.jpg";

const FeatureSections = () => {
  const { t } = useTranslation();
  return (
    <>
      {/* High-Speed Anywhere */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-black">
        <img src={earthImage} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/60" />
        <div className="relative container text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-light mb-6 leading-tight">
            {t("residential.feature.anywhereTitle")}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            {t("residential.feature.anywhereDesc")}
          </p>
        </div>
      </section>

      {/* Reliable Performance */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <img src={nightSky} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60" />
        <div className="relative container text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-light mb-6 leading-tight text-shadow-soft">
            {t("residential.feature.reliableTitle")}
          </h2>
          <p className="text-foreground/90 leading-relaxed text-base md:text-lg text-shadow-soft">
            {t("residential.feature.reliableDesc")}
            <Link to="/reliability" className="underline hover:text-muted-foreground">{t("residential.feature.reliableLink")}</Link>
          </p>
        </div>
      </section>

      {/* Internet for All */}
      <section className="relative py-24 md:py-32 bg-background">
        <div className="container text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-light mb-6 leading-tight">
            {t("residential.feature.allNeedsTitle")}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            {t("residential.feature.allNeedsDesc")}
            <Link to="/residential" className="underline hover:text-foreground">{t("residential.feature.allNeedsLink")}</Link>
          </p>
        </div>
      </section>

      {/* Self Installation + Unlimited */}
      <section id="specs" className="relative py-20 md:py-32 bg-background border-t border-border">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-center">
            <div className="relative aspect-square overflow-hidden bg-card flex items-center justify-center">
              <img src={kit} alt={t("residential.feature.kitAlt")} loading="lazy" className="w-full h-full object-cover" />
              <Link to="/videos" className="absolute inset-0 flex items-center justify-center group" aria-label={t("residential.feature.playVideo")}>
                <span className="w-20 h-20 rounded-full border-2 border-foreground/80 flex items-center justify-center bg-background/30 backdrop-blur-sm group-hover:bg-foreground group-hover:text-background transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-1">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </Link>
            </div>
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl md:text-4xl font-light mb-4">{t("residential.feature.selfInstallTitle")}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {t("residential.feature.selfInstallIntro")}
                </p>
                <ol className="space-y-2 text-foreground/90 mb-6">
                  <li className="flex gap-3"><span className="text-muted-foreground">1.</span> {t("residential.feature.step1")}</li>
                  <li className="flex gap-3"><span className="text-muted-foreground">2.</span> {t("residential.feature.step2")}</li>
                </ol>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {t("residential.feature.selfInstallNote")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/support" className="h-11 px-6 border border-border text-foreground hover:border-foreground/60 transition-colors text-xs tracking-widest inline-flex items-center justify-center">
                    {t("residential.feature.android")}
                  </Link>
                  <Link to="/support" className="h-11 px-6 border border-border text-foreground hover:border-foreground/60 transition-colors text-xs tracking-widest inline-flex items-center justify-center">
                    {t("residential.feature.ios")}
                  </Link>
                </div>
              </div>
              <div className="pt-8 border-t border-border">
                <h3 className="text-2xl md:text-4xl font-light mb-4">{t("residential.feature.unlimitedTitle")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("residential.feature.unlimitedDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FeatureSections;
