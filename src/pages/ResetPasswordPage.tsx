import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff, Check, CheckCircle } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import PasswordStrength from "@/components/PasswordStrength";
import { getRedirectParam, getQs } from "@/lib/auth";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { token } = useParams();
  const redirectTo = getRedirectParam();
  const qs = getQs(redirectTo);

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const newPassword = watch("newPassword", "");

  const onSubmit = async () => {
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
  };

  if (!token) {
    return (
      <AuthCard title="Invalid link" subtitle="This password reset link is invalid or expired">
        <div className="text-center">
          <p className="text-sm text-ink-soft">
            Please request a new password reset link.
          </p>
          <div className="mt-4">
            <Link
              to={`/forgot-password${qs}`}
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Request new link
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard title="Password updated" subtitle="Your password has been reset successfully">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-ink-soft">
            All your active sessions have been invalidated for security.
          </p>
          <Link
            to={`/login${qs}`}
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Sign in with new password
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set new password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input
            label="New Password"
            type={showNew ? "text" : "password"}
            placeholder="Enter new password"
            autoComplete="new-password"
            icon={<Lock className="h-4 w-4" />}
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-[38px] text-ink-soft hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <PasswordStrength password={newPassword} />
        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat new password"
            autoComplete="new-password"
            icon={<Check className="h-4 w-4" />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[38px] text-ink-soft hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth loading={loading}>
          Reset Password
        </Button>
      </form>
    </AuthCard>
  );
}
