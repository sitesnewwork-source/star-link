import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import worldMap from "@/assets/world-map.jpg";
import nightSky from "@/assets/night-sky.jpg";
import kit from "@/assets/starlink-kit.jpg";
import spacex from "@/assets/spacex.jpg";

const HomeFeatures = () => {
  const { t } = useTranslation();
  return (
    <>
      {/* Global Coverage */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-black">
        <img src={worldMap} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/40" />
        <div className="relative container text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-light mb-6 leading-tight text-shadow-soft">
            {t("home.globalTitle")}
          </h2>
          <p className="text-foreground/90 leading-relaxed text-base md:text-lg mb-6 text-shadow-soft">
            {t("home.globalDesc")}
          </p>
          <Link to="/map" className="inline-block text-sm text-foreground hover:text-muted-foreground transition-colors border-b border-foreground/40 pb-1">
            {t("home.globalCta")}
          </Link>
        </div>
      </section>

      {/* Reliable Performance */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <img src={nightSky} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/60" />
        <div className="relative container text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-light mb-6 leading-tight text-shadow-soft">
            {t("home.reliableTitle")}
          </h2>
          <p className="text-foreground/90 leading-relaxed text-base md:text-lg text-shadow-soft">
            {t("home.reliableDesc")}
            <Link to="/reliability" className="underline hover:text-muted-foreground">{t("home.reliableLink")}</Link>
          </p>
        </div>
      </section>

      {/* All Needs */}
      <section className="relative py-24 md:py-32 bg-background">
        <div className="container text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-light mb-6 leading-tight">
            {t("home.allNeedsTitle")}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            {t("home.allNeedsDesc")}
            <Link to="/residential" className="underline hover:text-foreground">{t("home.allNeedsLink")}</Link>
          </p>
        </div>
      </section>

      {/* Connect in Minutes */}
      <section className="relative py-20 md:py-32 bg-background border-t border-border">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto items-center">
            <div className="relative aspect-square overflow-hidden bg-card flex items-center justify-center">
              <img src={kit} alt={t("home.kitAlt")} loading="lazy" className="w-full h-full object-cover" />
              <Link to="/videos" className="absolute inset-0 flex items-center justify-center group" aria-label={t("home.playVideo")}>
                <span className="w-20 h-20 rounded-full border-2 border-foreground/80 flex items-center justify-center bg-background/30 backdrop-blur-sm group-hover:bg-foreground group-hover:text-background transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 mr-1">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </Link>
            </div>
            <div>
              <h3 className="text-2xl md:text-4xl font-light mb-6">{t("home.connectTitle")}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("home.connectIntro")}
              </p>
              <ol className="space-y-2 text-foreground/90 mb-6">
                <li className="flex gap-3"><span className="text-muted-foreground">.1</span> {t("home.connectStep1")}</li>
                <li className="flex gap-3"><span className="text-muted-foreground">.2</span> {t("home.connectStep2")}</li>
              </ol>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {t("home.connectNote")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/support" className="h-11 px-6 border border-border text-foreground hover:border-foreground/60 transition-colors text-xs tracking-widest inline-flex items-center justify-center">
                  {t("home.downloadAndroid")}
                </Link>
                <Link to="/support" className="h-11 px-6 border border-border text-foreground hover:border-foreground/60 transition-colors text-xs tracking-widest inline-flex items-center justify-center">
                  {t("home.downloadIos")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flexible Plans */}
      <section className="relative py-24 md:py-32 bg-background border-t border-border">
        <div className="container text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-light mb-6 leading-tight">
            {t("home.plansTitle")}
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            {t("home.plansDesc")}
            <Link to="/service-plans" className="underline hover:text-foreground">{t("home.plansLink")}</Link>
          </p>
        </div>
      </section>

      {/* SpaceX */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <img src={spacex} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-background/60" />
        <div className="relative container text-center max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-light mb-6 leading-tight text-shadow-soft tracking-wider">
            {t("home.spacexTitle")}
          </h2>
          <p className="text-foreground/90 leading-relaxed text-base md:text-lg mb-6 text-shadow-soft">
            {t("home.spacexDesc")}
          </p>
          <Link to="/technology" className="inline-block text-sm text-foreground hover:text-muted-foreground transition-colors border-b border-foreground/40 pb-1">
            {t("home.spacexCta")}
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomeFeatures;
