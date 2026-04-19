import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Price from "./Price";

interface ProductCardProps {
  name: string;
  description: string;
  /** Plain text price (legacy). Prefer `priceUsd` for dynamic discount rendering. */
  price?: string;
  /** Original USD price; renders the discounted + original strikethrough + badge. */
  priceUsd?: number;
  /** Text shown before the dynamic price (e.g. "Starting from "). */
  pricePrefix?: string;
  /** Text appended to the discounted price (e.g. "/month"). */
  priceSuffix?: string;
  href: string;
  plan?: "residential" | "roam-local" | "roam-unlimited" | "roam-global";
}

const ProductCard = ({
  name,
  description,
  price,
  priceUsd,
  pricePrefix,
  priceSuffix,
  href,
  plan,
}: ProductCardProps) => {
  const { t } = useTranslation();
  const checkoutHref = plan ? `/checkout?plan=${plan}` : "/checkout";
  return (
    <div className="relative p-8 md:p-10 bg-background/40 backdrop-blur-md border border-foreground/10 hover:border-foreground/30 transition-all">
      <h3 className="text-3xl md:text-4xl font-light mb-4 text-foreground">{name}</h3>
      <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-2">{description}</p>
      {priceUsd != null ? (
        <div className="text-foreground/90 text-sm mb-6 mt-4 flex flex-wrap items-baseline gap-x-1">
          {pricePrefix && <span>{pricePrefix}</span>}
          <Price usd={priceUsd} suffix={priceSuffix} size="sm" />
        </div>
      ) : price ? (
        <p className="text-foreground/90 text-sm mb-6 mt-4">{price}</p>
      ) : null}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
        <Link to={href} className="h-11 px-8 inline-flex items-center justify-center border border-foreground/60 text-foreground hover:bg-foreground hover:text-background transition-all text-sm font-medium tracking-wider">
          {t("common.learnMore")}
        </Link>
        <Link to={checkoutHref} className="h-11 px-8 inline-flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider">
          {t("common.getStarted")}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
