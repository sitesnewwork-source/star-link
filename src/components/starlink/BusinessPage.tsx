import { useState } from "react";
import { z } from "zod";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageShell from "@/components/starlink/PageShell";
import Breadcrumbs from "@/components/starlink/Breadcrumbs";
import { toast } from "@/hooks/use-toast";

interface BusinessPageProps {
  eyebrow: string;
  title: string;
  description: string;
  heroImage: string;
  features: { title: string; description: string }[];
  vertical: string;
}

const BusinessPage = ({ eyebrow, title, description, heroImage, features, vertical }: BusinessPageProps) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const schema = z.object({
    name: z.string().trim().min(2, t("business.form.errors.name")).max(100),
    company: z.string().trim().min(2, t("business.form.errors.company")).max(100),
    email: z.string().trim().email(t("business.form.errors.email")).max(255),
    phone: z.string().trim().regex(/^[0-9+\s-]{7,20}$/, t("business.form.errors.phone")),
    message: z.string().trim().max(1000).optional(),
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: t("business.form.validateTitle"), description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSent(true);
    toast({ title: t("business.form.successToastTitle"), description: t("business.form.successToastDesc", { vertical }) });
    setForm({ name: "", company: "", email: "", phone: "", message: "" });
  };

  return (
    <PageShell eyebrow={eyebrow} title={title} description={description} heroImage={heroImage}>
      <Breadcrumbs items={[{ label: t("business.breadcrumb"), to: "/business" }, { label: eyebrow }]} />

      <section className="container mx-auto px-6 py-20 grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {features.map((f) => (
          <div key={f.title} className="p-8 border border-foreground/10 hover:border-foreground/30 transition-all">
            <Check className="w-6 h-6 mb-4 text-foreground/70" />
            <h3 className="text-xl font-light mb-3">{f.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </section>

      <section id="contact" className="container mx-auto px-6 pb-20 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-light mb-3 text-center">{t("business.contactSales")}</h2>
        <p className="text-muted-foreground text-center mb-8">{t("business.contactDesc", { vertical })}</p>

        {sent ? (
          <div className="border border-foreground/20 p-8 text-center">
            <Check className="w-10 h-10 mx-auto mb-4" />
            <p className="text-lg mb-2">{t("business.form.thanks")}</p>
            <p className="text-sm text-muted-foreground">{t("business.form.thanksDesc")}</p>
            <button onClick={() => setSent(false)} className="mt-6 text-sm text-foreground hover:underline">
              {t("business.form.another")}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t("business.form.name")}</label>
                <input value={form.name} onChange={set("name")} required maxLength={100} className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t("business.form.company")}</label>
                <input value={form.company} onChange={set("company")} required maxLength={100} className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t("business.form.email")}</label>
                <input type="email" value={form.email} onChange={set("email")} required maxLength={255} className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{t("business.form.phone")}</label>
                <input type="tel" value={form.phone} onChange={set("phone")} required maxLength={20} className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">{t("business.form.message")}</label>
              <textarea value={form.message} onChange={set("message")} maxLength={1000} rows={4} className="w-full bg-transparent border border-foreground/20 p-4 focus:border-foreground outline-none transition-colors resize-none" />
            </div>
            <button type="submit" className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider">
              {t("business.form.submit")}
            </button>
          </form>
        )}
      </section>
    </PageShell>
  );
};

export default BusinessPage;
