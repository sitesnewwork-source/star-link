import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface PriceProps {
  /** Original USD amount (pre-discount). */
  usd: number;
  /** Optional suffix appended to the discounted price (e.g. "/شهر"). */
  suffix?: string;
  /** Show the red "خصم %" badge. Defaults to true. */
  showBadge?: boolean;
  /** Visual size of the discounted price. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Extra classes for the wrapper. */
  className?: string;
  /** Render badge inline next to the price (default) or hide it. */
}

const SIZE_CLASSES: Record<NonNullable<PriceProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl md:text-4xl",
  xl: "text-5xl md:text-6xl",
};

const Price = ({ usd, suffix = "", showBadge = true, size = "md", className }: PriceProps) => {
  const { format, formatOriginal, discountPercent } = useCurrency();
  const discounted = format(usd);
  const original = formatOriginal(usd);
  const hasDiscount = discountPercent > 0;

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <span className={cn("font-light text-foreground", SIZE_CLASSES[size])}>
        {discounted}
        {suffix && <span className="text-sm text-muted-foreground ms-1">{suffix}</span>}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted-foreground line-through decoration-destructive/70 decoration-2">
            {original}
          </span>
          {showBadge && (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-sm bg-destructive text-destructive-foreground uppercase">
              -{discountPercent}%
            </span>
          )}
        </>
      )}
    </span>
  );
};

export default Price;
