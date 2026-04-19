import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Quote, Loader2 } from "lucide-react";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import fallbackHero from "@/assets/biz-cases.jpg";
import { fetchCaseStudies, type CaseStudy } from "@/data/caseStudies";
import SEO from "@/components/SEO";

const CaseStudyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [items, setItems] = useState<CaseStudy[] | null>(null);

  useEffect(() => {
    fetchCaseStudies().then(setItems).catch(() => setItems([]));
  }, []);

  if (items === null) {
    return (
      <PageShell eyebrow="قصة نجاح" title="جاري التحميل" description="" heroImage={fallbackHero}>
        <div className="container py-20 text-center"><Loader2 className="w-6 h-6 animate-spin inline" /></div>
      </PageShell>
    );
  }

  const study = items.find((s) => s.slug === slug);
  if (!study) return <Navigate to="/business/case-studies" replace />;

  const related = items.filter((s) => s.industry === study.industry && s.slug !== study.slug).slice(0, 3);
  const fallback = items.filter((s) => s.slug !== study.slug).slice(0, 3);
  const relatedStudies = related.length > 0 ? related : fallback;

  return (
    <>
    <SEO
      title={`${study.company} — قصة نجاح | Starlink`}
      description={study.summary}
      path={`/business/case-studies/${study.slug}`}
      image={study.image}
      type="article"
    />
    <PageShell
      eyebrow={study.industry}
      title={study.company}
      description={study.summary}
      heroImage={study.image}
    >
      <Breadcrumbs
        items={[
          { label: "الأعمال التجارية", to: "/business" },
          { label: "قصص العملاء", to: "/business/case-studies" },
          { label: study.company },
        ]}
      />
      <section className="container mx-auto px-6 py-16 max-w-5xl">
        <Link
          to="/business/case-studies"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة إلى قصص النجاح
        </Link>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="border border-foreground/10 p-6 flex items-center gap-4">
            <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground tracking-wider uppercase mb-1">الموقع</div>
              <div className="text-sm">{study.location}</div>
            </div>
          </div>
          <div className="border border-foreground/10 p-6 flex items-center gap-4">
            <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
            <div>
              <div className="text-xs text-muted-foreground tracking-wider uppercase mb-1">مدة التنفيذ</div>
              <div className="text-sm">{study.duration}</div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-4">التحدي</p>
          <h2 className="text-2xl md:text-3xl font-light mb-6">المشكلة قبل ستارلينك</h2>
          <p className="text-muted-foreground leading-loose text-lg">{study.challenge}</p>
        </div>

        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-4">الحل</p>
          <h2 className="text-2xl md:text-3xl font-light mb-6">كيف نشرنا ستارلينك</h2>
          <p className="text-muted-foreground leading-loose text-lg">{study.solution}</p>
        </div>

        <div className="mb-16">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-4">النتائج</p>
          <h2 className="text-2xl md:text-3xl font-light mb-8">الأرقام بعد التنفيذ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-foreground/10 border border-foreground/10">
            {study.results.map((r) => (
              <div key={r.label} className="bg-background p-6 text-center">
                <div className="text-3xl md:text-4xl font-light mb-2">{r.value}</div>
                <div className="text-xs text-muted-foreground tracking-wider">{r.label}</div>
              </div>
            ))}
          </div>
        </div>

        {study.quote && (
          <blockquote className="border-r-2 border-foreground/30 pr-6 py-4 mb-16">
            <Quote className="w-8 h-8 text-foreground/20 mb-4" />
            <p className="text-xl md:text-2xl font-light leading-relaxed mb-6">"{study.quote.text}"</p>
            <footer className="text-sm">
              <div className="font-medium">{study.quote.author}</div>
              <div className="text-muted-foreground text-xs mt-1">{study.quote.role}</div>
            </footer>
          </blockquote>
        )}

        <div className="border-t border-foreground/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-light mb-2">جاهز لقصة نجاح مماثلة؟</h3>
            <p className="text-sm text-muted-foreground">تواصل مع فريق الأعمال لدراسة احتياجاتك</p>
          </div>
          <Link
            to="/business"
            className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm tracking-wider inline-flex items-center"
          >
            تواصل مع المبيعات
          </Link>
        </div>

        {relatedStudies.length > 0 && (
          <div className="border-t border-foreground/10 pt-16 mt-16">
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-4">قصص نجاح ذات صلة</p>
            <h2 className="text-2xl md:text-3xl font-light mb-10">
              {related.length > 0 ? `المزيد من قطاع ${study.industry}` : "اكتشف قصص نجاح أخرى"}
            </h2>
            <div className="grid md:grid-cols-3 gap-px bg-foreground/10 border border-foreground/10">
              {relatedStudies.map((s) => (
                <Link
                  key={s.slug}
                  to={`/business/case-studies/${s.slug}`}
                  className="bg-background p-6 group hover:bg-foreground/5 transition-colors flex flex-col"
                >
                  <div className="text-xs tracking-[0.2em] text-muted-foreground uppercase mb-3">{s.industry}</div>
                  <h3 className="text-lg font-light mb-3 group-hover:text-foreground transition-colors">{s.company}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{s.summary}</p>
                  <div className="flex items-end justify-between border-t border-foreground/10 pt-4">
                    <div>
                      <div className="text-2xl font-light">{s.metric}</div>
                      <div className="text-[10px] text-muted-foreground tracking-wider uppercase mt-1">{s.metricLabel}</div>
                    </div>
                    <span className="text-xs tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                      اقرأ المزيد ←
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </PageShell>
    </>
  );
};

export default CaseStudyDetail;
