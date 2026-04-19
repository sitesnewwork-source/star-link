import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
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

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [card, setCard] = useState<SavedCardMeta | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("starlink_order");
    const num = sessionStorage.getItem("starlink_order_number");
    if (!raw || !num) {
      navigate("/", { replace: true });
      return;
    }
    setOrder(JSON.parse(raw));
    setOrderNumber(num);
    setCard(readCardMeta());
    sessionStorage.removeItem("starlink_order");
    sessionStorage.removeItem("starlink_order_number");
    sessionStorage.removeItem("starlink_card");
    clearCardMeta();
  }, [navigate]);

  if (!order) return null;

  return (
    <>
      <SEO title={seoData.success.title} description={seoData.success.description} path="/payment/success" noIndex />

      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">

          {/* Success icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-foreground/20 mb-4">
              <CheckCircle2 className="w-10 h-10 text-foreground" />
            </div>
            <h1 className="text-2xl font-light tracking-wide mb-1">تمت العملية بنجاح</h1>
            <p className="text-sm text-muted-foreground">شكراً لك، تم تأكيد طلبك وسيتم معالجته قريباً</p>
          </div>

          {/* Order details */}
          <div className="border border-foreground/10 p-8 space-y-6">

            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">رقم الطلب</p>
                <p className="text-base font-medium tracking-wider">{orderNumber}</p>
              </div>
            </div>

            <div className="border-t border-foreground/10 pt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الاسم</span>
                <span>{order.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">البريد</span>
                <span>{order.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">العنوان</span>
                <span className="text-end">{order.address}, {order.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الخطة</span>
                <span>{order.planName}</span>
              </div>
              {card && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">البطاقة</span>
                  <SavedCardBadge brand={card.brand} last4={card.last4} />
                </div>
              )}
              <div className="flex justify-between border-t border-foreground/10 pt-3 font-medium">
                <span>الإجمالي</span>
                <span>{order.currency ?? "USD"} {order.total}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/"
                className="w-full h-12 inline-flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider"
              >
                العودة للرئيسية
              </Link>
              <Link
                to="/support"
                className="w-full h-12 inline-flex items-center justify-center border border-foreground/20 hover:border-foreground text-foreground transition-all text-sm"
              >
                تواصل مع الدعم
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
