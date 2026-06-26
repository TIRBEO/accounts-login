import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

const ALLOWED_HOSTS = [
  "localhost",
  "tirbeo.com",
  "www.tirbeo.com",
  "chat.tirbeo.com",
  "dashboard.tirbeo.com",
  "account.tirbeo.com",
  "accounts.tirbeo.com",
  "about.tirbeo.com",
  "docs.tirbeo.com",
  "blog.tirbeo.com",
];

export interface AppSession {
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  token: string;
  expiresAt: number;
}

export function isValidRedirect(redirectTo: string): boolean {
  try {
    const url = new URL(redirectTo);
    return (
      url.protocol === "https:" ||
      url.protocol === "http:" &&
      ALLOWED_HOSTS.some(
        (host) => url.hostname === host || url.hostname.endsWith("." + host),
      )
    );
  } catch {
    return false;
  }
}

export function getRedirectParam(): string | null {
  const params = new URLSearchParams(window.location.search);
  const r = params.get("redirect_to");
  if (r && isValidRedirect(r)) return r;
  return null;
}

export function getQs(redirectTo: string | null): string {
  return redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";
}

export function toAppSession(user: User, session: Session): AppSession {
  return {
    user: {
      id: user.id,
      email: user.email ?? "",
      username: user.user_metadata?.username ?? user.email?.split("@")[0] ?? "user",
      displayName: user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
      avatarUrl: user.user_metadata?.avatar_url,
    },
    token: session.access_token,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
}

export function encodeSession(appSession: AppSession): string {
  return btoa(JSON.stringify(appSession));
}

export function decodeSession(encoded: string): AppSession | null {
  try {
    return JSON.parse(atob(encoded)) as AppSession;
  } catch {
    return null;
  }
}

export function redirectWithSession(redirectTo: string, appSession: AppSession): void {
  const url = new URL(redirectTo);
  url.searchParams.set("session", encodeSession(appSession));
  window.location.href = url.toString();
}

export async function signInViaSupabase(redirectTo: string | null): Promise<AppSession | null> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return null;
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;
  const appSession = toAppSession(user, session);
  if (redirectTo) redirectWithSession(redirectTo, appSession);
  return appSession;
}
