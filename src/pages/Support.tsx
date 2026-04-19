import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const Support = () => {
  const { t } = useTranslation();
  const faqs = t("support.faqs", { returnObjects: true }) as { q: string; a: string }[];
  return (
    <>
    <SEO title={seoData.support.title} description={seoData.support.description} path="/support" />
    <PageShell
      eyebrow={t("support.eyebrow")}
      title={t("support.title")}
      description={t("support.description")}
    >
      <Breadcrumbs items={[{ label: t("support.breadcrumb") }]} />
      <section className="container mx-auto px-6 py-20 max-w-3xl space-y-6">
        {faqs.map((f) => (
          <details key={f.q} className="border border-foreground/10 p-6 group">
            <summary className="cursor-pointer text-lg font-light list-none flex justify-between items-center">
              {f.q}
              <span className="group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-muted-foreground mt-4 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </section>
    </PageShell>
    </>
  );
};

export default Support;
