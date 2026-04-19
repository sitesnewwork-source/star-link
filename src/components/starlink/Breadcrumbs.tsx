import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  className?: string;
}

const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Chevron = isRtl ? ChevronLeft : ChevronRight;
  return (
    <nav aria-label={t("common.breadcrumbAria")} className={`container mx-auto px-6 pt-8 max-w-6xl ${className}`}>
      <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <li>
          <Link to="/" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            {t("common.home")}
          </Link>
        </li>
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={`${c.label}-${i}`} className="contents">
              <Chevron className="w-3.5 h-3.5 opacity-50" />
              <li className={isLast ? "text-foreground font-medium" : ""} aria-current={isLast ? "page" : undefined}>
                {c.to && !isLast ? (
                  <Link to={c.to} className="hover:text-foreground transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  c.label
                )}
              </li>
            </span>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
