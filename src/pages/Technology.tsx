import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";
import heroImg from "@/assets/spacex.jpg";

const Technology = () => {
  const { t } = useTranslation();
  const sections = t("technology.sections", { returnObjects: true }) as { t: string; d: string }[];
  return (
    <>
    <SEO title={seoData.technology.title} description={seoData.technology.description} path="/technology" />
    <PageShell
      eyebrow={t("technology.eyebrow")}
      title={t("technology.title")}
      description={t("technology.description")}
      heroImage={heroImg}
    >
      <Breadcrumbs items={[{ label: t("technology.breadcrumb") }]} />
      <section className="container mx-auto px-6 py-20 max-w-4xl space-y-12">
        {sections.map((s) => (
          <div key={s.t}>
            <h3 className="text-2xl md:text-3xl font-light mb-3">{s.t}</h3>
            <p className="text-muted-foreground leading-relaxed">{s.d}</p>
          </div>
        ))}
      </section>
    </PageShell>
    </>
  );
};

export default Technology;
