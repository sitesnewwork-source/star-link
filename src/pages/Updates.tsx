import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const Updates = () => {
  const { t } = useTranslation();
  const updates = t("updates.items", { returnObjects: true }) as { date: string; title: string; body: string }[];
  return (
    <>
    <SEO title={seoData.updates.title} description={seoData.updates.description} path="/updates" />
    <PageShell
      eyebrow={t("updates.eyebrow")}
      title={t("updates.title")}
      description={t("updates.description")}
    >
      <Breadcrumbs items={[{ label: t("updates.breadcrumb") }]} />
      <section className="container mx-auto px-6 py-20 max-w-3xl space-y-8">
        {updates.map((u) => (
          <article key={u.title} className="border-b border-foreground/10 pb-8">
            <p className="text-xs text-muted-foreground tracking-wider mb-2">{u.date}</p>
            <h3 className="text-2xl font-light mb-3">{u.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{u.body}</p>
          </article>
        ))}
      </section>
    </PageShell>
    </>
  );
};

export default Updates;
