import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const Stories = () => {
  const { t } = useTranslation();
  const stories = t("stories.items", { returnObjects: true }) as { name: string; quote: string }[];
  return (
    <>
    <SEO title={seoData.stories.title} description={seoData.stories.description} path="/stories" />
    <PageShell
      eyebrow={t("stories.eyebrow")}
      title={t("stories.title")}
      description={t("stories.description")}
    >
      <Breadcrumbs items={[{ label: t("stories.breadcrumb") }]} />
      <section className="container mx-auto px-6 py-20 grid md:grid-cols-3 gap-8 max-w-6xl">
        {stories.map((s) => (
          <div key={s.name} className="p-8 border border-foreground/10">
            <p className="text-lg font-light leading-relaxed mb-6">"{s.quote}"</p>
            <p className="text-sm text-muted-foreground">— {s.name}</p>
          </div>
        ))}
      </section>
    </PageShell>
    </>
  );
};

export default Stories;
