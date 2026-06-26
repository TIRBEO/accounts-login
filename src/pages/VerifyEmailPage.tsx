import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import Button from "@/components/Button";

const DIGITS = 6;

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect_to");
  const qs = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";

  const [digits, setDigits] = useState<string[]>(Array(DIGITS).fill(""));
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    const code = digits.join("");
    if (code.length !== DIGITS) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setVerified(true);
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
          {redirectTo ? (
            <Button fullWidth onClick={() => window.location.href = redirectTo}>
              Continue
            </Button>
          ) : (
            <Button fullWidth>Continue to Dashboard</Button>
          )}
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
          Verify Email
        </Button>
      </form>

      <div className="mt-4 flex flex-col items-center gap-2 text-sm">
        <button
          type="button"
          onClick={async () => {
            setResending(true);
            await new Promise((r) => setTimeout(r, 1000));
            setResending(false);
          }}
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
