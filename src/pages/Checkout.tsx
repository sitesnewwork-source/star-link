import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { PiggyBank, Sparkles } from "lucide-react";
import PageShell from "@/components/starlink/PageShell";
import Price from "@/components/starlink/Price";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCountry } from "@/contexts/CountryContext";
import { updateVisitorData } from "@/hooks/useVisitorTracking";
import { useCountUp } from "@/hooks/useCountUp";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const schema = z.object({
  fullName: z.string().trim().min(2, "الاسم مطلوب").max(100),
  phone: z.string().trim().regex(/^[0-9+\s-]{7,20}$/, "رقم هاتف غير صالح"),
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(255),
  address: z.string().trim().min(5, "العنوان مطلوب").max(255),
  city: z.string().trim().min(2, "المدينة مطلوبة").max(100),
  plan: z.enum(["residential", "roam-local", "roam-unlimited", "roam-global"]),
});

const planLabels: Record<string, { name: string; price: number }> = {
  residential: { name: "المنازل", price: 25 },
  "roam-local": { name: "التجوال — محلي", price: 40 },
  "roam-unlimited": { name: "التجوال — غير محدود", price: 95 },
  "roam-global": { name: "التجوال — عالمي", price: 200 },
};

const EQUIPMENT_USD = 599;

const Checkout = () => {
  const navigate = useNavigate();
  const { format, formatOriginal, convert, currency, discountPercent } = useCurrency();
  const { info } = useCountry();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get("plan");
  const addressParam = searchParams.get("address") ?? "";
  const cityParam = searchParams.get("city") ?? "";
  const initialPlan = (planParam && planParam in planLabels ? planParam : "residential") as keyof typeof planLabels;
  const initialCity = info.cities.includes(cityParam) ? cityParam : info.cities[0];
  const [form, setForm] = useState({
    fullName: "",
    phone: info.dialCode + " ",
    email: "",
    address: addressParam.slice(0, 200),
    city: initialCity,
    plan: initialPlan,
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "تحقق من البيانات", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    const plan = planLabels[parsed.data.plan];
    const equipmentUsd = EQUIPMENT_USD;
    const totalUsd = equipmentUsd + plan.price;
    const equipment = Math.round(convert(equipmentUsd) * 100) / 100;
    const monthly = Math.round(convert(plan.price) * 100) / 100;
    const total = Math.round(convert(totalUsd) * 100) / 100;

    // Fire-and-forget: tracking failures must NEVER block the user from reaching payment.
    void updateVisitorData({
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      city: parsed.data.city,
      country: info.nameAr,
      plan_selected: plan.name,
      order_total: `${total} ${currency}`,
    }).catch((err) => console.error("[checkout] visitor tracking failed", err));

    const orderNumber = "SL-" + Math.random().toString(36).slice(2, 10).toUpperCase();
    sessionStorage.setItem(
      "starlink_order",
      JSON.stringify({ ...parsed.data, planName: plan.name, monthly, equipment, total, currency, totalUsd })
    );
    sessionStorage.setItem("starlink_order_number", orderNumber);
    navigate("/payment");
  };

  const plan = planLabels[form.plan];
  const equipment = EQUIPMENT_USD;
  // Final discounted total in active currency — animate from 0 on mount/plan change.
  const finalSavings = convert(equipment + plan.price);
  const animatedSavings = useCountUp(finalSavings, 1400);

  return (
    <>
    <SEO title={seoData.checkout.title} description={seoData.checkout.description} path="/checkout" noIndex />
    <PageShell eyebrow="إتمام الطلب" title="معلومات التوصيل والباقة" description="أدخل عنوان التوصيل واختر باقتك للمتابعة إلى الدفع.">
      <section className="container mx-auto px-6 py-16 grid lg:grid-cols-3 gap-8 max-w-6xl">
        <form onSubmit={onSubmit} className="lg:col-span-2 space-y-4">
          {[
            { k: "fullName", l: "الاسم الكامل", t: "text" },
            { k: "phone", l: `رقم الهاتف (${info.dialCode})`, t: "tel" },
            { k: "email", l: "البريد الإلكتروني", t: "email" },
            { k: "address", l: "عنوان التوصيل", t: "text" },
          ].map((f) => (
            <div key={f.k}>
              <label className="text-sm text-muted-foreground mb-2 block">{f.l}</label>
              <input
                type={f.t}
                required
                value={form[f.k as keyof typeof form] as string}
                onChange={set(f.k as keyof typeof form)}
                className="w-full h-12 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">المدينة — {info.nameAr}</label>
            <select
              value={form.city}
              onChange={set("city")}
              className="w-full h-12 bg-background border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors"
            >
              {info.cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">الباقة</label>
            <select
              value={form.plan}
              onChange={set("plan")}
              className="w-full h-12 bg-background border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors"
            >
              {Object.entries(planLabels).map(([k, v]) => (
                <option key={k} value={k}>{v.name} — {format(v.price)}/شهر</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider mt-6">
            المتابعة إلى الدفع
          </button>
        </form>

        <aside className="space-y-4 h-fit">
          <div className="border border-foreground/10 p-6 space-y-4">
            <h3 className="text-lg font-light border-b border-foreground/10 pb-3">ملخص الطلب</h3>
            <div className="flex justify-between items-center text-sm gap-2">
              <span className="text-muted-foreground">جهاز ستارلينك</span>
              <Price usd={equipment} size="sm" showBadge={false} />
            </div>
            <div className="flex justify-between items-center text-sm gap-2">
              <span className="text-muted-foreground">{plan.name} (شهر أول)</span>
              <Price usd={plan.price} size="sm" showBadge={false} />
            </div>
            <div className="flex justify-between items-center text-base border-t border-foreground/10 pt-3 font-medium gap-2">
              <span>الإجمالي</span>
              <Price usd={equipment + plan.price} size="md" />
            </div>
          </div>

          {/* Savings card */}
          <div className="relative overflow-hidden border border-[#d4af37]/40 bg-gradient-to-br from-black via-zinc-900 to-black text-white p-6">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background:
                  "linear-gradient(110deg, transparent 30%, rgba(212,175,55,0.4) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
                animation: "savingsSheen 5s linear infinite",
              }}
              aria-hidden
            />
            <style>{`@keyframes savingsSheen{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

            <div className="relative space-y-3">
              <div className="flex items-center gap-2 text-[#d4af37]">
                <PiggyBank className="w-5 h-5" />
                <span className="text-[10px] tracking-[0.3em] uppercase opacity-80">وفّرت اليوم</span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light tabular-nums text-[#d4af37]">
                  {format(equipment + plan.price).replace(
                    /[\d,]+/,
                    Math.round(animatedSavings).toLocaleString("en-US"),
                  )}
                </span>
                <span className="text-xs text-white/50 line-through tabular-nums">
                  {formatOriginal(equipment + plan.price)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/70">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>
                  بفضل خصم <span className="text-[#d4af37] font-semibold">{discountPercent}%</span> على الجهاز والباقة
                </span>
              </div>

              <div className="pt-3 border-t border-[#d4af37]/20 grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <p className="text-white/50 mb-0.5">السعر الأصلي</p>
                  <p className="tabular-nums line-through text-white/70">{formatOriginal(equipment + plan.price)}</p>
                </div>
                <div>
                  <p className="text-[#d4af37]/80 mb-0.5">سعرك الآن</p>
                  <p className="tabular-nums text-[#d4af37] font-semibold">{format(equipment + plan.price)}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </PageShell>
    </>
  );
};

export default Checkout;
