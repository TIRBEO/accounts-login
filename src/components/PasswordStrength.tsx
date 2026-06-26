import { useMemo } from "react";
import { cn } from "@/lib/utils";

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score: 3, label: "Good", color: "bg-yellow-500" };
  if (score <= 4) return { score: 4, label: "Strong", color: "bg-lime-500" };
  return { score: 5, label: "Very Strong", color: "bg-green-500" };
}

export default function PasswordStrength({ password }: { password: string }) {
  const strength = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < strength.score
                ? strength.color
                : "bg-border",
            )}
            style={{
              width: i < strength.score ? `${100 / 5}%` : `${100 / 5}%`,
            }}
          />
        ))}
      </div>
      <p className="text-xs text-ink-soft">
        Strength:{" "}
        <span
          className={cn(
            "transition-colors duration-300",
            strength.score <= 2 && "text-destructive",
            strength.score === 3 && "text-yellow-500",
            strength.score >= 4 && "text-green-500",
          )}
        >
          {strength.label}
        </span>
      </p>
    </div>
  );
}
