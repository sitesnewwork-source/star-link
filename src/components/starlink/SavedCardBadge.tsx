import { CardBrandLogo, CardBrand } from "./CardBrandLogos";

interface SavedCardBadgeProps {
  brand: CardBrand;
  last4: string;
  className?: string;
}

/**
 * يعرض شعار البطاقة + آخر 4 أرقام (••••  1234)
 * يُستخدم في صفحات OTP / PIN / Success لتذكير العميل بالبطاقة المستخدمة.
 */
export const SavedCardBadge = ({ brand, last4, className = "" }: SavedCardBadgeProps) => {
  if (!last4) return null;
  return (
    <div
      className={`inline-flex items-center gap-3 border border-foreground/10 bg-muted/40 px-3 py-2 rounded-md ${className}`}
    >
      <CardBrandLogo brand={brand} />
      <div className="flex items-center gap-1 font-mono text-sm tracking-wider text-foreground">
        <span className="text-muted-foreground">••••</span>
        <span className="text-muted-foreground">••••</span>
        <span className="text-muted-foreground">••••</span>
        <span className="font-semibold">{last4}</span>
      </div>
    </div>
  );
};

export interface SavedCardMeta {
  brand: CardBrand;
  last4: string;
}

const STORAGE_KEY = "starlink_card_meta";

export const saveCardMeta = (meta: SavedCardMeta) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
};

export const readCardMeta = (): SavedCardMeta | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedCardMeta;
  } catch {
    return null;
  }
};

export const clearCardMeta = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};
