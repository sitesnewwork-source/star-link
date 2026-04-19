import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Session } from "@supabase/supabase-js";

const schema = z.object({
  email: z.string().trim().email("بريد إلكتروني غير صالح").max(255),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل").max(72),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setChecking(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checking) {
    return (
      <main className="admin-light min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </main>
    );
  }

  if (session) return <Navigate to="/admin/visitors" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "تحقق من البيانات", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "أهلاً بعودتك" });
      navigate("/admin/visitors");
    } catch (err: any) {
      toast({
        title: "تعذّر الدخول",
        description: err?.message?.includes("Invalid login") ? "البريد أو كلمة المرور غير صحيحة" : err?.message ?? "حدث خطأ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-light min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="text-sm tracking-[0.3em] font-light">STARLINK</Link>
          <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">منطقة الإدارة</span>
        </div>
      </header>
      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-light mb-2">دخول لوحة التحكم</h1>
            <p className="text-sm text-muted-foreground">هذه الصفحة مخصّصة للمدراء فقط.</p>
          </div>
          <div className="border border-border bg-foreground/[0.02] p-8 space-y-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              <span>اتصال آمن — صلاحيات الإدارة مطلوبة</span>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-all text-sm font-medium tracking-wider disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "دخول"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminLogin;
