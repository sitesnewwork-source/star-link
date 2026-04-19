import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, PiggyBank, Sparkles } from "lucide-react";
import PageShell from "@/components/starlink/PageShell";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCountUp } from "@/hooks/useCountUp";
import { SavedCardBadge, readCardMeta, clearCardMeta, SavedCardMeta } from "@/components/starlink/SavedCardBadge";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

interface Order {
  fullName: string;
  email: string;
  address: string;
  city: string;
  planName: string;
  total: number;
  currency?: string;
}

const Success = () => {
  const navigate = useNavigate();
  const { discountPercent, symbol } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [card, setCard] = useState<SavedCardMeta | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("starlink_order");
    const num = sessionStorage.getItem("starlink_order_number");
    if (!raw || !num) {
      navigate("/");
      return;
    }
    setOrder(JSON.parse(raw));
    setOrderNumber(num);
    setCard(readCardMeta());
    sessionStorage.removeItem("starlink_order");
    sessionStorage.removeItem("starlink_card_last4");
    sessionStorage.removeItem("starlink_order_number");
    clearCardMeta();
  }, [navigate]);

  // Compute the savings: if a 50% discount is active, paid = saved.
  // More generally: saved = paid * discount/(100-discount).
  const paid = order?.total ?? 0;
  const savings = discountPercent > 0 && discountPercent < 100
    ? (paid * discountPercent) / (100 - discountPercent)
    : 0;
  const animated = useCountUp(savings, 1800);

  if (!order) return null;

  const currency = order.currency ?? symbol;
  const fmtNum = (n: number) =>
    Math.round(n).toLocaleString("en-US");

  return (
    <PageShell eyebrow="تم الطلب بنجاح" title="شكراً لطلبك!" description="تم تأكيد طلبك وسنرسل لك تفاصيل الشحن قريباً عبر البريد الإلكتروني.">
      <section className="container mx-auto px-6 py-16 max-w-2xl space-y-6">
        {/* Celebratory savings card */}
        {savings > 0 && (
          <div className="relative overflow-hidden border border-[#d4af37]/40 bg-gradient-to-br from-black via-zinc-900 to-black text-white p-8 motion-safe:animate-[successPop_600ms_cubic-bezier(0.22,1,0.36,1)_both]">
            {/* Sheen */}
            <div
              className="absolute inset-0 opacity-25 pointer-events-none"
              style={{
                background:
                  "linear-gradient(110deg, transparent 30%, rgba(212,175,55,0.45) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "successSheen 4s linear infinite",
              }}
              aria-hidden
            />
            {/* Confetti dots */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              {[...Array(14)].map((_, i) => (
                <span
                  key={i}
                  className="absolute block w-1.5 h-1.5 rounded-full"
                  style={{
                    left: `${(i * 7.3) % 100}%`,
                    top: `${(i * 11.7) % 100}%`,
                    background: i % 2 === 0 ? "#d4af37" : "#ffffff",
                    opacity: 0.7,
                    animation: `confettiFall ${2 + (i % 4)}s ease-in ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
            <style>{`
              @keyframes successSheen{0%{background-position:200% 0}100%{background-position:-200% 0}}
              @keyframes successPop{from{transform:scale(.96);opacity:0}to{transform:scale(1);opacity:1}}
              @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0);opacity:0}20%{opacity:.9}100%{transform:translateY(120px) rotate(360deg);opacity:0}}
            `}</style>

            <div className="relative space-y-4 text-center">
              <div className="inline-flex items-center gap-2 text-[#d4af37]">
                <PiggyBank className="w-5 h-5" />
                <span className="text-[10px] tracking-[0.3em] uppercase opacity-80">
                  مبروك! وفّرت في هذا الطلب
                </span>
              </div>

              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl md:text-6xl font-light tabular-nums text-[#d4af37]">
                  {currency} {fmtNum(animated)}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 text-xs text-white/70">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>
                  بفضل خصم{" "}
                  <span className="text-[#d4af37] font-semibold">
                    {discountPercent}%
                  </span>{" "}
                  المطبّق على طلبك
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="border border-foreground/10 p-8 space-y-6">
          <div className="flex items-center gap-3 text-foreground">
            <CheckCircle2 className="w-10 h-10" />
            <div>
              <p className="text-sm text-muted-foreground">رقم الطلب</p>
              <p className="text-xl font-medium tracking-wider">{orderNumber}</p>
            </div>
          </div>

          <div className="border-t border-foreground/10 pt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">الاسم</span>
              <span>{order.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">البريد الإلكتروني</span>
              <span>{order.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">العنوان</span>
              <span className="text-end">{order.address}, {order.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الباقة</span>
              <span>{order.planName}</span>
            </div>
            {card && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">طريقة الدفع</span>
                <SavedCardBadge brand={card.brand} last4={card.last4} />
              </div>
            )}
            <div className="flex justify-between border-t border-foreground/10 pt-3 text-base font-medium">
              <span>المبلغ المدفوع</span>
              <span>{order.currency ?? "USD"} {order.total}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link to="/" className="flex-1 h-12 inline-flex items-center justify-center border border-foreground/60 text-foreground hover:bg-foreground hover:text-background transition-all text-sm font-medium tracking-wider">
              الرئيسية
            </Link>
            <Link to="/support" className="flex-1 h-12 inline-flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider">
              تتبع الطلب
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Success;
