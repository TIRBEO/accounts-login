import { useMemo, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = useMemo(() => ({
    primary: "glass-button glass-button-primary",
    secondary: "glass-button glass-button-secondary",
    ghost: "bg-transparent text-ink-soft hover:text-foreground hover:bg-secondary/50",
    outline: "glass-button border border-border/50 bg-transparent text-foreground hover:bg-secondary/50",
  }), []);

  const sizes = useMemo(() => ({
    sm: "h-9 px-3.5 text-xs rounded-lg",
    md: "h-11 px-5 text-sm rounded-xl",
    lg: "h-13 px-7 text-base rounded-xl",
  }), []);

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && variant === "primary" && (
        <span className="absolute inset-0" style={{
          background: "linear-gradient(90deg, transparent 0%, oklch(0 0 0 / 0.08) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s linear infinite",
        }} />
      )}
      {loading && variant !== "primary" && (
        <span className="absolute inset-0 shimmer" />
      )}
      <span className={cn("relative z-10 inline-flex items-center gap-2", loading && "opacity-70")}>
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </span>
    </button>
  );
}
