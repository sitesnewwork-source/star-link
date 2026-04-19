import { useState } from "react";
import { Wifi } from "lucide-react";

interface Card3DPreviewProps {
  holder?: string | null;
  number?: string | null;
  expiry?: string | null;
  cvv?: string | null;
}

const detectBrand = (n: string): "VISA" | "MASTERCARD" | "AMEX" | "CARD" => {
  const d = n.replace(/\D/g, "");
  if (/^4/.test(d)) return "VISA";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "MASTERCARD";
  if (/^3[47]/.test(d)) return "AMEX";
  return "CARD";
};

const formatNumber = (n: string) => {
  const d = n.replace(/\D/g, "");
  if (!d) return "•••• •••• •••• ••••";
  return d.padEnd(16, "•").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
};

/**
 * 3D flippable card preview for the admin dashboard.
 * Front shows holder/number/expiry; back reveals the CVV strip on tap/click.
 */
export const Card3DPreview = ({ holder, number, expiry, cvv }: Card3DPreviewProps) => {
  const [flipped, setFlipped] = useState(false);
  const brand = detectBrand(number || "");
  const displayNumber = formatNumber(number || "");
  const displayHolder = (holder || "CARD HOLDER").toUpperCase();
  const displayExpiry = expiry || "MM/YY";
  const displayCvv = cvv || "•••";

  return (
    <div className="w-full flex justify-center py-2 [perspective:1200px]">
      <button
        type="button"
        aria-label={flipped ? "إظهار الوجه الأمامي" : "إظهار CVV"}
        onClick={() => setFlipped((f) => !f)}
        className="group relative w-full max-w-[340px] aspect-[1.586/1] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[18px]"
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          } group-hover:[transform:rotateY(8deg)] group-hover:scale-[1.015] ${
            flipped ? "group-hover:[transform:rotateY(188deg)]" : ""
          }`}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 [backface-visibility:hidden] rounded-[18px] p-5 flex flex-col justify-between text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, hsl(220 70% 18%) 0%, hsl(260 60% 25%) 50%, hsl(290 65% 30%) 100%)",
            }}
          >
            {/* Decorative shine */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.4) 0%, transparent 40%)",
              }}
            />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-2">
                {/* Chip */}
                <div
                  className="w-10 h-7 rounded-md"
                  style={{
                    background:
                      "linear-gradient(135deg, #d4af37 0%, #f4d76b 50%, #b8941f 100%)",
                    boxShadow: "inset 0 0 4px rgba(0,0,0,0.4)",
                  }}
                />
                <Wifi className="w-4 h-4 rotate-90 opacity-80" />
              </div>
              <span className="text-xs font-bold tracking-wider opacity-90">
                {brand}
              </span>
            </div>

            <div className="relative font-mono text-lg tracking-[0.18em] [direction:ltr] text-center select-all">
              {displayNumber}
            </div>

            <div className="relative flex items-end justify-between text-[10px] uppercase tracking-wider [direction:ltr]">
              <div>
                <div className="opacity-60">Card Holder</div>
                <div className="text-sm font-semibold tracking-wide truncate max-w-[180px]">
                  {displayHolder}
                </div>
              </div>
              <div className="text-right">
                <div className="opacity-60">Expires</div>
                <div className="text-sm font-semibold tracking-wide">
                  {displayExpiry}
                </div>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[18px] flex flex-col text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, hsl(220 30% 15%) 0%, hsl(240 25% 20%) 100%)",
            }}
          >
            <div className="h-10 mt-5 bg-black/80" />
            <div className="px-5 mt-5 flex items-center gap-3 [direction:ltr]">
              <div className="flex-1 h-9 bg-white/95 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, transparent 0 6px, rgba(0,0,0,0.04) 6px 12px)",
                  }}
                />
              </div>
              <div className="bg-white text-black font-mono text-base px-3 py-1 tracking-[0.2em] min-w-[70px] text-center">
                {displayCvv}
              </div>
            </div>
            <div className="px-5 mt-3 text-[10px] opacity-60 [direction:ltr] text-right">
              CVV / CVC
            </div>
            <div className="mt-auto px-5 pb-4 flex items-center justify-between [direction:ltr]">
              <span className="text-[9px] opacity-50 max-w-[60%] leading-tight">
                Authorized signature. Not valid unless signed.
              </span>
              <span className="text-xs font-bold tracking-wider opacity-90">
                {brand}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground tracking-wider uppercase">
          {flipped ? "اضغط لإخفاء CVV" : "اضغط لقلب البطاقة وعرض CVV"}
        </div>
      </button>
    </div>
  );
};

export default Card3DPreview;
