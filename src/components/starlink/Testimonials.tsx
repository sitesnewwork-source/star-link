import { useTranslation } from "react-i18next";

const Testimonials = () => {
  const { t } = useTranslation();
  const testimonials = [
    {
      title: t("residential.testimonials.t1Title"),
      quote: t("residential.testimonials.t1Quote"),
      author: t("residential.testimonials.t1Author"),
    },
    {
      title: t("residential.testimonials.t2Title"),
      quote: t("residential.testimonials.t2Quote"),
      author: t("residential.testimonials.t2Author"),
    },
    {
      title: t("residential.testimonials.t3Title"),
      quote: t("residential.testimonials.t3Quote"),
      author: t("residential.testimonials.t3Author"),
    },
  ];

  return (
    <section id="testimonials" className="relative py-20 md:py-32 bg-background border-t border-border">
      <div className="container">
        <h2 className="text-3xl md:text-5xl font-light text-center mb-16">{t("residential.testimonials.heading")}</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((tm) => (
            <div key={tm.title} className="p-8 border border-border bg-card/40 hover:border-foreground/30 transition-colors">
              <h3 className="text-xl font-light mb-4 text-foreground">{tm.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm mb-6 min-h-[8rem]">"{tm.quote}"</p>
              <p className="text-xs text-foreground/60 tracking-wider">— {tm.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
