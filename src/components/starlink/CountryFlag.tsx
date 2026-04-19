import "flag-icons/css/flag-icons.min.css";
import type { CountryCode } from "@/contexts/CountryContext";

interface CountryFlagProps {
  code: CountryCode;
  /** Tailwind size classes — defaults to a small inline flag */
  className?: string;
  /** Use squared variant instead of 4x3 */
  squared?: boolean;
}

/**
 * Renders an SVG country flag from the `flag-icons` library.
 * Uses ISO 3166-1 alpha-2 codes (lowercased).
 */
const CountryFlag = ({ code, className = "w-5 h-[15px]", squared = false }: CountryFlagProps) => {
  const variant = squared ? "fis" : "fi";
  return (
    <span
      className={`${variant} fi-${code.toLowerCase()} inline-block bg-cover bg-center bg-no-repeat rounded-[2px] shrink-0 ${className}`}
      role="img"
      aria-label={code}
    />
  );
};

export default CountryFlag;
