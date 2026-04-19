import { Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import EmailSignup from "./EmailSignup";

const Footer = () => {
  const { t } = useTranslation();
  const footerLinks = [
    { label: t("footer.links.jobs"), to: "/support" },
    { label: t("footer.links.operators"), to: "/technology" },
    { label: t("footer.links.resellers"), to: "/business" },
    { label: t("footer.links.privacy"), to: "/support" },
    { label: t("footer.links.preferences"), to: "/support" },
  ];
  return (
    <>
      <EmailSignup compact />
      <footer className="bg-background border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <Link to="/" className="text-foreground font-bold tracking-[0.3em] text-lg">{t("brand")}</Link>
            <a href="https://twitter.com/Starlink" target="_blank" rel="noreferrer" aria-label={t("footer.twitterAria")} className="text-foreground/70 hover:text-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-8 text-sm text-muted-foreground">
            {footerLinks.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="hover:text-foreground transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
          <div className="text-center text-xs text-muted-foreground/70 space-y-2">
            <p>{t("footer.copyright")}</p>
            <p>{t("footer.tagline")}</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
