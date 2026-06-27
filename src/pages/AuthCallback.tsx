import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toAppSession, redirectWithSession, DASHBOARD_URL } from "@/lib/auth";

type Status = "exchanging" | "success" | "error";

export default function AuthCallback() {
  const [status, setStatus] = useState<Status>("exchanging");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      // Check URL hash first (Supabase uses #access_token=... after OAuth)
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);

      // If no code in query and no hash, Supabase client should have already
      // processed the hash during createClient(). Listen for auth state change.
      const code = params.get("code");

      if (code) {
        // PKCE flow
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!cancelled) { setStatus("error"); setError(exchangeError.message); }
          return;
        }
      } else if (hash && hash.includes("access_token")) {
        // Hash flow — supabase-js picks this up automatically,
        // but we wait a tick for it to process
        await new Promise((r) => setTimeout(r, 300));
      }

      // Get session (handles PKCE, hash, and existing sessions)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        // Try onAuthStateChange as fallback — sometimes the session isn't ready yet
        const timeout = setTimeout(() => {
          if (!cancelled) {
            setStatus("error");
            setError(
              code
                ? "Failed to retrieve session after code exchange."
                : "No session received. Check your Supabase Authentication settings — Site URL must be set to this app's URL and the Redirect URLs must include this page."
            );
          }
        }, 5000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            clearTimeout(timeout);
            subscription.unsubscribe();
            handleSuccess(session);
          }
        });

        return;
      }

      handleSuccess(session);
    };

    const handleSuccess = async (session: any) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        if (!cancelled) { setStatus("error"); setError("Failed to retrieve user"); }
        return;
      }

      const appSession = toAppSession(user, session);
      const redirectTo = sessionStorage.getItem("oauth_redirect_to");
      sessionStorage.removeItem("oauth_redirect_to");

      if (!cancelled) { setStatus("success"); }

      setTimeout(() => {
        if (redirectTo) {
          redirectWithSession(redirectTo, appSession);
        } else {
          window.location.href = DASHBOARD_URL;
        }
      }, 800);
    };

    handleCallback();

    return () => { cancelled = true; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      {/* Deep ambient glow behind card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[2rem] opacity-40 blur-3xl"
        style={{
          background: [
            "radial-gradient(ellipse at 30% 20%, oklch(0.55 0.22 260 / 0.12), transparent 50%)",
            "radial-gradient(ellipse at 70% 80%, oklch(0.6 0.2 280 / 0.08), transparent 50%)",
          ].join(","),
        }}
      />
      <div className="glass-card relative overflow-hidden rounded-2xl p-8 shadow-2xl">
        {/* Animated gradient orbs */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-56 w-[110%] -translate-x-1/2 blur-[80px]"
          style={{
            background: "linear-gradient(180deg, oklch(0.55 0.22 260 / 0.12) 0%, transparent 100%)",
          }}
          animate={{ opacity: [0.4, 0.7, 0.4], y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-20 h-48 w-48 blur-[100px] rounded-full"
          style={{ background: "oklch(0.6 0.25 280 / 0.06)" }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 h-48 w-48 blur-[100px] rounded-full"
          style={{ background: "oklch(0.5 0.2 240 / 0.06)" }}
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.15, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <div className="relative z-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="mb-7 text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Tirbeo" className="h-14 w-14 object-contain brightness-0 invert" />
            </div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "2.5rem" }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mb-3 h-px bg-gradient-to-r from-transparent via-ink-soft/30 to-transparent"
            />
          </motion.div>

          {/* Status content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            {status === "exchanging" && (
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 animate-spin text-foreground" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="mt-4 text-sm text-ink-soft">Completing sign in...</p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="mt-4 text-sm text-foreground">Signed in successfully</p>
                <p className="mt-1 text-xs text-ink-soft">Redirecting...</p>
              </div>
            )}

            {status === "error" && (
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">Sign in failed</p>
                <p className="mt-1 text-xs text-destructive">{error}</p>
                <div className="mt-4 flex justify-center gap-3">
                  <a
                    href="/login"
                    className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
                  >
                    Try again
                  </a>
                  <a
                    href="/"
                    className="rounded-lg border border-border px-4 py-2 text-sm text-ink-soft hover:text-foreground"
                  >
                    Go home
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
