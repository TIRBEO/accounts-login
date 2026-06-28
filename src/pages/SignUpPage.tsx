import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, AtSign, Lock, Eye, EyeOff, Check } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import SocialButtons from "@/components/SocialButtons";
import PasswordStrength from "@/components/PasswordStrength";
import { getRedirectParam, getQs } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const schema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    displayName: z.string().min(1, "Display name is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "You must accept the Terms of Service",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const redirectTo = getRedirectParam();
  const qs = getQs(redirectTo);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { acceptTerms: false },
  });

  const password = watch("password", "");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");

    sessionStorage.setItem(
      "pending_signup",
      JSON.stringify({
        email: data.email,
        password: data.password,
        username: data.username,
        displayName: data.displayName,
      })
    );

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?mode=signup`,
        data: {
          username: data.username,
          display_name: data.displayName,
        },
      },
    });

    if (otpError) {
      sessionStorage.removeItem("pending_signup");
      if (otpError.message.includes("already registered") || otpError.message.includes("already exists")) {
        setError(
          "An account with this email already exists. If you signed up with Google, GitHub, or Discord, try signing in with that method instead."
        );
      } else {
        setError(otpError.message);
      }
      setLoading(false);
      return;
    }

    window.location.href = `/verify-email?email=${encodeURIComponent(data.email)}&mode=signup${qs}`;
  };

  const handleNext = async () => {
    const fields: (keyof FormData)[] =
      step === 1 ? ["email", "username", "displayName"] : ["password", "confirmPassword", "acceptTerms"];
    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, 2));
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle={step === 1 ? "Step 1 of 2 — Basic info" : "Step 2 of 2 — Security"}
    >
      <div className="mb-6 flex gap-1.5">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              s <= step ? "bg-foreground" : "bg-border"
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Username"
                placeholder="johndoe"
                autoComplete="username"
                icon={<AtSign className="h-4 w-4" />}
                error={errors.username?.message}
                {...register("username")}
              />
              <Input
                label="Display Name"
                placeholder="John Doe"
                autoComplete="name"
                icon={<User className="h-4 w-4" />}
                error={errors.displayName?.message}
                {...register("displayName")}
              />
            </div>
            <Button type="button" fullWidth onClick={handleNext}>
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-ink-soft hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
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
            <label className="flex cursor-pointer items-start gap-2 text-sm text-ink-soft hover:text-foreground/80 transition-colors">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-border bg-secondary text-foreground accent-foreground"
                {...register("acceptTerms")}
              />
              <span>
                I agree to the{" "}
                <a href="#" className="text-foreground underline-offset-2 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-foreground underline-offset-2 hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.acceptTerms && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive/90"
              >
                {errors.acceptTerms.message}
              </motion.p>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs text-destructive/90 backdrop-blur-sm"
              >
                {error}
              </motion.p>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" fullWidth loading={loading}>
                Create Account
              </Button>
            </div>
          </>
        )}
      </form>

      {step === 1 && <SocialButtons redirectTo={redirectTo || undefined} />}

      <p className="mt-6 text-center text-sm text-ink-soft">
        {step === 1 ? (
          <>
            Already have an account?{" "}
            <Link
              to={`/login${qs}`}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              Sign In
            </Link>
          </>
        ) : null}
      </p>
    </AuthCard>
  );
}
