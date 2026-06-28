import { supabase } from "@/lib/supabase";

export interface UserSession {
  id: string;
  user_id: string;
  device: string;
  location: string | null;
  ip_address: string | null;
  is_current: boolean;
  last_active_at: string;
  created_at: string;
}

export async function getSessions(): Promise<UserSession[]> {
  const { data } = await supabase
    .from("user_sessions")
    .select("*")
    .order("last_active_at", { ascending: false });
  return (data as UserSession[]) ?? [];
}

export async function revokeSession(sessionId: string): Promise<void> {
  await supabase.from("user_sessions").delete().eq("id", sessionId);
}

export async function revokeOtherSessions(currentSessionId: string): Promise<void> {
  await supabase.from("user_sessions").delete().neq("id", currentSessionId);
}

export async function recordSession(sessionId: string, userId: string): Promise<void> {
  const ua = navigator.userAgent;
  const device = ua.includes("Windows") ? "Windows" :
    ua.includes("Mac") ? "macOS" :
    ua.includes("Linux") ? "Linux" :
    ua.includes("iPhone") ? "iPhone" :
    ua.includes("Android") ? "Android" : "Unknown";

  await supabase.from("user_sessions").insert({
    id: sessionId,
    user_id: userId,
    device: `${getBrowser()} on ${device}`,
    is_current: true,
    last_active_at: new Date().toISOString(),
  });
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Browser";
}
