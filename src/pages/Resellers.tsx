import { useState } from "react";
import { z } from "zod";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import { toast } from "@/hooks/use-toast";
import hero from "@/assets/resellers.jpg";

const Resellers = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ company: "", contact: "", email: "", phone: "", region: "", experience: "" });
  const [sent, setSent] = useState(false);

  const benefits = t("resellers.benefits", { returnObjects: true }) as { title: string; description: string }[];

  const schema = z.object({
    company: z.string().trim().min(2, t("resellers.errors.company")).max(100),
    contact: z.string().trim().min(2, t("resellers.errors.contact")).max(100),
    email: z.string().trim().email(t("resellers.errors.email")).max(255),
    phone: z.string().trim().regex(/^[0-9+\s-]{7,20}$/, t("resellers.errors.phone")),
    region: z.string().trim().min(2, t("resellers.errors.region")).max(100),
    experience: z.string().trim().max(1000).optional(),
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: t("resellers.errors.checkTitle"), description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSent(true);
    toast({ title: t("resellers.successTitle"), description: t("resellers.successDesc") });
  };

  return (
    <PageShell
      eyebrow={t("resellers.eyebrow")}
      title={t("resellers.title")}
      description={t("resellers.description")}
      heroImage={hero}
    >
      <Breadcrumbs items={[{ label: t("resellers.breadcrumb") }]} />
      <section className="container mx-auto px-6 py-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {benefits.map((b) => (
          <div key={b.title} className="p-8 border border-foreground/10 hover:border-foreground/30 transition-all">
            <Check className="w-6 h-6 mb-4 text-foreground/70" />
            <h3 className="text-xl font-light mb-3">{b.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>
          </div>
        ))}
      </section>

      <section id="apply" className="container mx-auto px-6 pb-20 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-light mb-3 text-center">{t("resellers.applyTitle")}</h2>
        <p className="text-muted-foreground text-center mb-8">{t("resellers.applyDesc")}</p>

        {sent ? (
          <div className="border border-foreground/20 p-8 text-center">
            <Check className="w-10 h-10 mx-auto mb-4" />
            <p className="text-lg mb-2">{t("resellers.sentTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("resellers.sentDesc")}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t("resellers.form.company")}</label>
                <input value={form.company} onChange={set("company")} required maxLength={100} className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t("resellers.form.contact")}</label>
                <input value={form.contact} onChange={set("contact")} required maxLength={100} className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t("resellers.form.email")}</label>
                <input type="email" value={form.email} onChange={set("email")} required maxLength={255} className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t("resellers.form.phone")}</label>
                <input type="tel" value={form.phone} onChange={set("phone")} required maxLength={20} className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">{t("resellers.form.region")}</label>
              <input value={form.region} onChange={set("region")} required maxLength={100} className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">{t("resellers.form.experience")}</label>
              <textarea value={form.experience} onChange={set("experience")} maxLength={1000} rows={4} className="w-full bg-transparent border border-foreground/20 p-4 focus:border-foreground outline-none transition-colors resize-none" />
            </div>
            <button type="submit" className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider">
              {t("resellers.form.submit")}
            </button>
          </form>
        )}
      </section>
    </PageShell>
  );
};

export default Resellers;
