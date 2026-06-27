import { motion } from "framer-motion";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md relative"
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
          <div className="mb-7 text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
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

              <h1 className="font-display text-[1.65rem] font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-1.5 text-sm text-ink-soft"
                >
                  {subtitle}
                </motion.p>
              )}
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
