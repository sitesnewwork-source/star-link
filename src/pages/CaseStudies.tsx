import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import hero from "@/assets/biz-cases.jpg";
import { fetchCaseStudies, type CaseStudy } from "@/data/caseStudies";
import { toast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const ALL = "الكل";

const CaseStudies = () => {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(ALL);

  useEffect(() => {
    fetchCaseStudies()
      .then(setItems)
      .catch((e) => toast({ title: "تعذّر تحميل القصص", description: e.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const industries = useMemo(() => {
    const set = new Set(items.map((i) => i.industry));
    return [ALL, ...Array.from(set).sort()];
  }, [items]);

  const counts = useMemo(() => {
    const m: Record<string, number> = { [ALL]: items.length };
    for (const i of items) m[i.industry] = (m[i.industry] || 0) + 1;
    return m;
  }, [items]);

  const visible = filter === ALL ? items : items.filter((i) => i.industry === filter);

  return (
    <PageShell
      eyebrow="قصص النجاح"
      title="قصص عملاء الأعمال"
      description="اكتشف كيف تستخدم المؤسسات الرائدة في مختلف القطاعات ستارلينك للأعمال لتحويل عملياتها وتجاوز قيود الاتصال التقليدية."
      heroImage={hero}
    >
      <Breadcrumbs items={[{ label: "الأعمال التجارية", to: "/business" }, { label: "قصص العملاء" }]} />
      <section className="container mx-auto px-6 py-20">
        {loading ? (
          <div className="text-center py-20"><Loader2 className="w-6 h-6 animate-spin inline" /></div>
        ) : (
          <>
            {industries.length > 2 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setFilter(ind)}
                    className={`h-9 px-4 text-xs tracking-wider border transition-all inline-flex items-center gap-2 ${filter === ind ? "border-foreground bg-foreground/5" : "border-foreground/20 hover:border-foreground/50"}`}
                  >
                    {ind}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === ind ? "bg-foreground text-background" : "bg-foreground/10 text-muted-foreground"}`}>
                      {counts[ind] || 0}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {visible.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-sm">لا توجد قصص في هذا القطاع</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map((s) => (
                  <Link
                    key={s.slug}
                    to={`/business/case-studies/${s.slug}`}
                    className="border border-foreground/10 hover:border-foreground/30 transition-all group block overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={s.image}
                        alt={s.company}
                        loading="lazy"
                        width={1600}
                        height={900}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">{s.industry}</p>
                      <h3 className="text-xl font-light mb-4">{s.company}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{s.summary}</p>
                      <div className="flex items-end justify-between border-t border-foreground/10 pt-4">
                        <div>
                          <div className="text-3xl font-light">{s.metric}</div>
                          <div className="text-xs text-muted-foreground mt-1">{s.metricLabel}</div>
                        </div>
                        <span className="text-xs inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          التفاصيل <ArrowLeft className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </PageShell>
    </>
  );
};

export default CaseStudies;

