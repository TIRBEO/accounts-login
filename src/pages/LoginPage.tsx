import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import AuthCard from "@/components/AuthCard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import SocialButtons from "@/components/SocialButtons";
import { getRedirectParam, getQs, redirectWithSession, toAppSession, DASHBOARD_URL } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = getRedirectParam();
  const qs = getQs(redirectTo);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      if (authError.message.includes("Invalid login credentials")) {
        setError(
          "Invalid email or password. If you signed up with Google, GitHub, or Discord, use that button instead."
        );
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    if (!authData.session || !authData.user) {
      setError("Authentication failed. Please try again.");
      setLoading(false);
      return;
    }

    const appSession = toAppSession(authData.user, authData.session);

    redirectWithSession(redirectTo || DASHBOARD_URL, appSession);
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your Tirbeo account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
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

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs text-destructive/90 backdrop-blur-sm"
          >
            {error}
          </motion.p>
        )}

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-ink-soft/70 hover:text-foreground/80 transition-colors">
            <input
              type="checkbox"
              className="rounded-md border-border/60 bg-secondary/50 text-foreground accent-foreground size-4"
              {...register("remember")}
            />
            Remember me
          </label>
          <Link
            to={`/forgot-password${qs}`}
            className="text-ink-soft underline-offset-2 hover:text-foreground hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth loading={loading}>
          Sign In
        </Button>
      </form>
      <SocialButtons redirectTo={redirectTo || undefined} />
      <p className="mt-6 text-center text-sm text-ink-soft">
        Don&apos;t have an account?{" "}
        <Link
          to={`/signup${qs}`}
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </AuthCard>
  );
}
