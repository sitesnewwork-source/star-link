import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";

const Specifications = () => {
  const { t } = useTranslation();
  const rows = t("specifications.rows", { returnObjects: true }) as { k: string; v: string }[];
  return (
    <PageShell
      eyebrow={t("specifications.eyebrow")}
      title={t("specifications.title")}
      description={t("specifications.description")}
    >
      <Breadcrumbs items={[{ label: t("specifications.breadcrumb") }]} />
      <section className="container mx-auto px-6 py-20 max-w-3xl">
        <div className="border border-foreground/10">
          {rows.map((r, i) => (
            <div key={r.k} className={`flex justify-between p-5 ${i !== rows.length - 1 ? "border-b border-foreground/10" : ""}`}>
              <span className="text-muted-foreground">{r.k}</span>
              <span className="text-foreground">{r.v}</span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
};

export default Specifications;
