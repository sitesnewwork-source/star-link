import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface EmailSignupProps {
  compact?: boolean;
}

const EmailSignup = ({ compact = false }: EmailSignupProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      toast({ title: t("residential.email.invalidTitle", { defaultValue: "بريد إلكتروني غير صالح" }), variant: "destructive" });
      return;
    }
    toast({ title: t("residential.email.thanksTitle", { defaultValue: "تم الاشتراك" }), description: email });
    setEmail("");
  };
  return (
    <section className={`relative ${compact ? "py-12" : "py-20 md:py-28"} bg-background border-t border-border`}>
      <div className="container max-w-3xl text-center">
        {!compact && (
          <>
            <h3 className="text-2xl md:text-4xl font-light mb-3 tracking-wider">
              {t("residential.email.title")}
            </h3>
            <p className="text-muted-foreground mb-8">{t("residential.email.subtitle")}</p>
          </>
        )}
        {compact && (
          <h4 className="text-lg md:text-xl font-light mb-6 text-foreground/90">
            {t("residential.email.compactTitle")}
          </h4>
        )}
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("residential.email.placeholder")}
            className="flex-1 h-12 bg-input border border-border px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/50 transition-colors text-sm"
          />
          <button
            type="submit"
            className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider"
          >
            {t("residential.email.subscribe")}
          </button>
        </form>
        <Link to="/support" className="inline-block mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors underline">
          {t("residential.email.privacy")}
        </Link>
      </div>
    </section>
  );
};

export default EmailSignup;
