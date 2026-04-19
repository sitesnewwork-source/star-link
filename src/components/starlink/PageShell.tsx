import Header from "@/components/starlink/Header";
import Footer from "@/components/starlink/Footer";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  heroImage?: string;
  children?: React.ReactNode;
}

const PageShell = ({ eyebrow, title, description, ctaLabel, ctaHref, heroImage, children }: PageShellProps) => {
  const { t, i18n } = useTranslation();
  const Back = i18n.dir() === "rtl" ? ChevronRight : ChevronLeft;
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <section className="relative min-h-[70vh] flex items-end overflow-hidden pt-24">
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="relative z-10 container mx-auto px-6 py-16 md:py-24">
          <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6">
            <Back className="w-4 h-4" />
            {t("business.backHome")}
          </Link>
          {eyebrow && (
            <p className="text-xs md:text-sm tracking-[0.3em] text-muted-foreground mb-4 uppercase">{eyebrow}</p>
          )}
          <h1 className="text-4xl md:text-6xl font-light mb-6 leading-tight max-w-4xl">{title}</h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">{description}</p>
          {ctaLabel && ctaHref && (
            <a
              href={ctaHref}
              className="h-12 px-8 inline-flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider"
            >
              {ctaLabel}
            </a>
          )}
        </div>
      </section>
      {children}
      <Footer />
    </main>
  );
};

export default PageShell;
