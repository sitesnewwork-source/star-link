import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";

const Reliability = () => {
  const { t } = useTranslation();
  const stats = t("reliability.stats", { returnObjects: true }) as { n: string; l: string }[];
  return (
    <PageShell
      eyebrow={t("reliability.eyebrow")}
      title={t("reliability.title")}
      description={t("reliability.description")}
    >
      <Breadcrumbs items={[{ label: t("reliability.breadcrumb") }]} />
      <section className="container mx-auto px-6 py-20 grid md:grid-cols-3 gap-8 max-w-5xl">
        {stats.map((s) => (
          <div key={s.l} className="text-center p-8 border border-foreground/10">
            <p className="text-5xl font-light mb-2">{s.n}</p>
            <p className="text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </section>
    </PageShell>
  );
};

export default Reliability;
