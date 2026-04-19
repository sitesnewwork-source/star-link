import { CreditCard } from "lucide-react";

export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "jcb"
  | "unionpay"
  | "unknown";

export const detectCardBrand = (raw: string): CardBrand => {
  const n = raw.replace(/\D/g, "");
  if (!n) return "unknown";
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^6(?:011|5)/.test(n)) return "discover";
  if (/^3(?:0[0-5]|[68])/.test(n)) return "diners";
  if (/^35(2[89]|[3-8])/.test(n)) return "jcb";
  if (/^(62|81)/.test(n)) return "unionpay";
  return "unknown";
};

const wrapper = "inline-flex items-center justify-center bg-white rounded-[4px] shadow-sm border border-black/5 overflow-hidden";

const Visa = ({ className = "" }: { className?: string }) => (
  <div className={`${wrapper} ${className}`} style={{ width: 38, height: 24 }}>
    <svg viewBox="0 0 48 16" xmlns="http://www.w3.org/2000/svg" width="34" height="12" aria-label="Visa">
      <path fill="#1A1F71" d="M18.4 15.6h-3.9L17 .5h3.9l-2.5 15.1zM10.5.5L6.8 10.9 6.4 8.7 5.1 2.1S4.9.5 3 .5H-3.2l-.1.3s2.1.4 4.5 1.9l3.4 13H8.7L14.9.5h-4.4zm32 15.1h3.6L43 .5h-3.1c-1.5 0-1.8 1.1-1.8 1.1L32.3 15.6h4.1l.8-2.3h5l.3 2.3zm-4.4-5.4l2.1-5.7 1.2 5.7h-3.3zM33 4.1l.6-3.3S31.9 0 30 0c-2 0-7 .9-7 5.4 0 4.2 5.9 4.2 5.9 6.4 0 2.2-5.3 1.8-7 .4l-.6 3.4s1.7.8 4.4.8c2.7 0 6.7-1.4 6.7-5.5 0-4.3-5.9-4.7-5.9-6.4 0-1.7 4.1-1.5 6.5-.4z"/>
    </svg>
  </div>
);

const Mastercard = ({ className = "" }: { className?: string }) => (
  <div className={`${wrapper} ${className}`} style={{ width: 38, height: 24 }}>
    <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg" width="34" height="22" aria-label="Mastercard">
      <circle cx="19" cy="16" r="10" fill="#EB001B"/>
      <circle cx="29" cy="16" r="10" fill="#F79E1B"/>
      <path fill="#FF5F00" d="M24 8.5a10 10 0 0 1 0 15 10 10 0 0 1 0-15z"/>
    </svg>
  </div>
);

const Amex = ({ className = "" }: { className?: string }) => (
  <div className={`${wrapper} ${className}`} style={{ width: 38, height: 24, background: "#2E77BB" }}>
    <svg viewBox="0 0 48 16" xmlns="http://www.w3.org/2000/svg" width="34" height="12" aria-label="American Express">
      <text x="24" y="11.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="9" fill="#FFFFFF" letterSpacing="0.3">AMEX</text>
    </svg>
  </div>
);

const Discover = ({ className = "" }: { className?: string }) => (
  <div className={`${wrapper} ${className}`} style={{ width: 38, height: 24 }}>
    <svg viewBox="0 0 48 16" xmlns="http://www.w3.org/2000/svg" width="36" height="12" aria-label="Discover">
      <text x="24" y="10.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="6.5" fill="#000">DISCOVER</text>
      <circle cx="36" cy="13.5" r="2" fill="#FF6000"/>
    </svg>
  </div>
);

const Diners = ({ className = "" }: { className?: string }) => (
  <div className={`${wrapper} ${className}`} style={{ width: 38, height: 24 }}>
    <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg" width="22" height="22" aria-label="Diners Club">
      <circle cx="24" cy="16" r="13" fill="#0079BE"/>
      <path fill="#FFF" d="M19 7a9 9 0 1 0 0 18V7zm10 9a9 9 0 0 1-9 9V7a9 9 0 0 1 9 9z"/>
    </svg>
  </div>
);

const Jcb = ({ className = "" }: { className?: string }) => (
  <div className={`${wrapper} ${className}`} style={{ width: 38, height: 24 }}>
    <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg" width="36" height="22" aria-label="JCB">
      <rect x="2" y="4" width="14" height="24" rx="2" fill="#0E4C96"/>
      <rect x="17" y="4" width="14" height="24" rx="2" fill="#D0112B"/>
      <rect x="32" y="4" width="14" height="24" rx="2" fill="#00A651"/>
      <text x="24" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="8" fill="#FFF">JCB</text>
    </svg>
  </div>
);

const UnionPay = ({ className = "" }: { className?: string }) => (
  <div className={`${wrapper} ${className}`} style={{ width: 38, height: 24 }}>
    <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg" width="36" height="22" aria-label="UnionPay">
      <rect x="2" y="6" width="14" height="20" fill="#E21836"/>
      <rect x="17" y="6" width="14" height="20" fill="#00447C"/>
      <rect x="32" y="6" width="14" height="20" fill="#007B5F"/>
      <text x="24" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="6" fill="#FFF">UnionPay</text>
    </svg>
  </div>
);

export const CardBrandLogo = ({ brand, className }: { brand: CardBrand; className?: string }) => {
  switch (brand) {
    case "visa": return <Visa className={className} />;
    case "mastercard": return <Mastercard className={className} />;
    case "amex": return <Amex className={className} />;
    case "discover": return <Discover className={className} />;
    case "diners": return <Diners className={className} />;
    case "jcb": return <Jcb className={className} />;
    case "unionpay": return <UnionPay className={className} />;
    default:
      return <CreditCard className={`w-5 h-5 text-muted-foreground ${className ?? ""}`} />;
  }
};
