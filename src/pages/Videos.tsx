import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";

const Videos = () => {
  const { t } = useTranslation();
  const videos = t("videos.items", { returnObjects: true }) as string[];
  return (
    <PageShell
      eyebrow={t("videos.eyebrow")}
      title={t("videos.title")}
      description={t("videos.description")}
    >
      <Breadcrumbs items={[{ label: t("videos.breadcrumb") }]} />
      <section className="container mx-auto px-6 py-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v) => (
          <div key={v} className="border border-foreground/10 hover:border-foreground/30 transition-all">
            <div className="aspect-video bg-foreground/5 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border border-foreground/40 flex items-center justify-center">▶</div>
            </div>
            <p className="p-4 text-sm">{v}</p>
          </div>
        ))}
      </section>
    </PageShell>
  );
};

export default Videos;
