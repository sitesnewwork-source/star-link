import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import heroImg from "@/assets/world-map.jpg";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const Business = () => {
  const { t } = useTranslation();
  return (
    <>
    <SEO title={seoData.business.title} description={seoData.business.description} path="/business" />
    <PageShell
      eyebrow={t("business.overview.eyebrow")}
      title={t("business.overview.title")}
      description={t("business.overview.description")}
      ctaLabel={t("business.overview.cta")}
      ctaHref="#contact"
      heroImage={heroImg}
    >
      <section className="container mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        {[
          { t: t("business.overview.f1Title"), d: t("business.overview.f1Desc") },
          { t: t("business.overview.f2Title"), d: t("business.overview.f2Desc") },
          { t: t("business.overview.f3Title"), d: t("business.overview.f3Desc") },
        ].map((f) => (
          <div key={f.t} className="p-8 border border-foreground/10 hover:border-foreground/30 transition-all">
            <h3 className="text-2xl font-light mb-3">{f.t}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{f.d}</p>
          </div>
        ))}
      </section>
    </PageShell>
    </>
  );
};

export default Business;
