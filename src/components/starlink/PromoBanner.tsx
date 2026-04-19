import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, X, Clock } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const DISMISS_KEY = "sl_promo_banner_dismissed_v1";
const DEADLINE_KEY = "sl_promo_deadline_v1";

/** Generate a random deadline between 1h and 23h59m from now (always under 24h). */
const generateDeadline = () => {
  const minMs = 60 * 60 * 1000; // 1 hour
  const maxMs = 23 * 60 * 60 * 1000 + 59 * 60 * 1000; // 23h 59m
  const span = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return Date.now() + span;
};

const getOrCreateDeadline = (): number => {
  if (typeof window === "undefined") return Date.now() + 60 * 60 * 1000;
  const raw = localStorage.getItem(DEADLINE_KEY);
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed > Date.now()) return parsed;
  const next = generateDeadline();
  localStorage.setItem(DEADLINE_KEY, String(next));
  return next;
};

const formatRemaining = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

const PromoBanner = () => {
  const { t, i18n } = useTranslation();
  const { discountPercent } = useCurrency();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [deadline, setDeadline] = useState<number>(0);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Persistent dismissal across sessions (localStorage); also respect old per-session flag.
    if (localStorage.getItem(DISMISS_KEY) || sessionStorage.getItem(DISMISS_KEY)) return;
    setDeadline(getOrCreateDeadline());
    setOpen(true);
  }, []);

  // Tick every second while visible.
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  // If countdown reaches zero, regenerate a new random window so the banner stays useful.
  useEffect(() => {
    if (!open || !deadline) return;
    if (now >= deadline) {
      const next = generateDeadline();
      localStorage.setItem(DEADLINE_KEY, String(next));
      setDeadline(next);
    }
  }, [now, deadline, open]);

  // Sync top padding so fixed page elements (header, hero) don't sit under the banner.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (open && !closing) {
      root.style.setProperty("--promo-banner-h", "44px");
      root.classList.add("has-promo-banner");
    } else {
      root.style.setProperty("--promo-banner-h", "0px");
      root.classList.remove("has-promo-banner");
    }
    return () => {
      root.style.setProperty("--promo-banner-h", "0px");
      root.classList.remove("has-promo-banner");
    };
  }, [open, closing]);

  if (!open || discountPercent <= 0) return null;

  const isAr = i18n.language?.startsWith("ar");
  const message = isAr
    ? `عرض محدود: خصم ${discountPercent}% على كل الباقات والمنتجات`
    : `Limited offer: ${discountPercent}% OFF on all plans and products`;
  const endsLabel = isAr ? "ينتهي خلال" : "Ends in";
  const cta = isAr ? "تسوّق الآن" : "Shop now";
  const remaining = formatRemaining(deadline - now);

  const dismiss = () => {
    if (closing) return;
    setClosing(true);
    // Persist permanently so the banner stays hidden on future visits too.
    localStorage.setItem(DISMISS_KEY, "1");
    sessionStorage.setItem(DISMISS_KEY, "1");
    // Wait for slide-up animation to finish before unmounting.
    window.setTimeout(() => setOpen(false), 350);
  };

  return (
    <div
      role="region"
      aria-label={isAr ? "إعلان عرض" : "Promotional offer"}
      className={`fixed top-0 inset-x-0 z-[70] shadow-lg overflow-hidden ${
        closing
          ? "motion-safe:animate-[promoSlideUp_350ms_cubic-bezier(0.4,0,1,1)_forwards]"
          : "motion-safe:animate-[promoSlideDown_500ms_cubic-bezier(0.22,1,0.36,1)_both]"
      }`}
      style={{ height: "var(--promo-banner-h, 44px)" }}
    >
      <style>{`@keyframes promoSlideDown{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes promoSlideUp{from{transform:translateY(0);opacity:1}to{transform:translateY(-100%);opacity:0}}`}</style>
      {/* Elegant black background with subtle gold sheen */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-zinc-900 to-black" aria-hidden />
      <div
        className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
        style={{
          background:
            "linear-gradient(110deg, transparent 30%, rgba(212,175,55,0.35) 50%, transparent 70%)",
          backgroundSize: "200% 100%",
          animation: "promoSheen 6s linear infinite",
        }}
        aria-hidden
      />
      {/* Top & bottom gold hairlines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" aria-hidden />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/70 to-transparent" aria-hidden />

      <style>{`@keyframes promoSheen{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      <div className="relative container h-full flex items-center justify-center gap-2 sm:gap-4 px-3 text-xs sm:text-sm">
        <Sparkles className="w-4 h-4 shrink-0 text-[#d4af37] animate-pulse" aria-hidden />
        <span className="font-light tracking-wide text-white truncate">
          <span className="text-[#d4af37] font-semibold">{discountPercent}% </span>
          {isAr ? message.replace(`خصم ${discountPercent}% `, "") : message.replace(`${discountPercent}% OFF `, "")}
        </span>
        <span
          className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#d4af37]/40 bg-[#d4af37]/5 text-[#d4af37] font-mono tabular-nums text-[11px] sm:text-xs tracking-wider"
          aria-live="polite"
          aria-label={`${endsLabel} ${remaining}`}
        >
          <Clock className="w-3 h-3" aria-hidden />
          <span className="hidden sm:inline opacity-80">{endsLabel}</span>
          <span className="font-semibold">{remaining}</span>
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label={isAr ? "إغلاق الإعلان" : "Dismiss"}
          className="ms-auto p-1 -m-1 rounded text-white/60 hover:text-[#d4af37] hover:bg-white/5 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;
