import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DASHBOARD_URL } from "@/lib/auth";
import AuthCard from "@/components/AuthCard";
import Button from "@/components/Button";

const DIGITS = 6;

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const mode = searchParams.get("mode");
  const redirectTo = searchParams.get("redirect_to");
  const qs = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";

  const [digits, setDigits] = useState<string[]>(Array(DIGITS).fill(""));
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      setError("No email address provided. Please sign up again.");
    }
  }, [email]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError("");

    if (value && index < DIGITS - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < DIGITS - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, DIGITS);
    if (!text) return;
    const next = Array(DIGITS).fill("");
    for (let i = 0; i < text.length; i++) {
      next[i] = text[i];
    }
    setDigits(next);
    const focusIdx = Math.min(text.length, DIGITS - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("No email address provided");
      return;
    }
    const code = digits.join("");
    if (code.length !== DIGITS) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (verifyError) {
      if (verifyError.message.includes("expired") || verifyError.message.includes("Token has expired")) {
        setError("Code has expired. Request a new one.");
      } else if (verifyError.message.includes("Invalid") || verifyError.message.includes("otp")) {
        setError("Invalid code. Check the code and try again.");
      } else {
        setError(verifyError.message);
      }
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      setSettingPassword(true);
      const pending = sessionStorage.getItem("pending_signup");
      if (pending) {
        const { password } = JSON.parse(pending);
        const { error: pwError } = await supabase.auth.updateUser({ password });
        if (pwError) {
          setError(pwError.message);
          setSettingPassword(false);
          setLoading(false);
          return;
        }
        sessionStorage.removeItem("pending_signup");
      }
      setSettingPassword(false);
    }

    setLoading(false);
    setVerified(true);
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError("");

    const { error: sendError } = await supabase.auth.signInWithOtp({ email });

    if (sendError) {
      setError(sendError.message);
      setResending(false);
      return;
    }

    setDigits(Array(DIGITS).fill(""));
    inputRefs.current[0]?.focus();
    setResending(false);
  };

  if (verified) {
    return (
      <AuthCard title="Email verified" subtitle="Your email has been verified successfully">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-ink-soft">
            You can now access all Tirbeo services with your account.
          </p>
          <Button fullWidth onClick={() => window.location.href = redirectTo || DASHBOARD_URL}>
            Continue
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Verify your email" subtitle="Enter the 6-digit code sent to your email">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
          <Mail className="h-6 w-6" style={{ color: "oklch(0.63 0.18 260)" }} />
        </div>

        {email && (
          <p className="text-center text-sm text-ink-soft">
            We sent a code to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        )}

        <div className="otp-group">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className={`otp-input ${d ? "filled" : ""}`}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && <p className="text-center text-xs text-destructive">{error}</p>}

        <Button type="submit" fullWidth loading={loading}>
          {settingPassword ? "Setting up your account..." : "Verify Email"}
        </Button>
      </form>

      <div className="mt-4 flex flex-col items-center gap-2 text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-ink-soft underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend code"}
        </button>
        <Link
          to={`/login${qs}`}
          className="inline-flex items-center gap-1 text-ink-soft underline-offset-2 hover:text-foreground hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to sign in
        </Link>
      </div>
    </AuthCard>
  );
}
