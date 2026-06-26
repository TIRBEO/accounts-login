import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-foreground/80 tracking-wide"
      >
        {label}
      </label>
      <div className={cn("relative rounded-xl glass-input", error && "error")}>
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-soft/60">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full rounded-xl bg-transparent px-3.5 py-3 text-sm text-foreground placeholder:text-ink-soft/30 outline-none transition-all",
            icon ? "pl-10" : undefined,
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive/90 pl-0.5"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
