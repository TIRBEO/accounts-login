import { Outlet } from "react-router-dom";

export default function AccountsLayout() {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-foreground/10 selection:text-foreground">
      {/* Deep animated background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            background: [
              "radial-gradient(60% 40% at 25% 15%, oklch(0.18 0.04 280 / 0.6), transparent 60%)",
              "radial-gradient(50% 35% at 75% 20%, oklch(0.12 0.04 260 / 0.5), transparent 60%)",
              "radial-gradient(40% 30% at 50% 85%, oklch(0.1 0.03 300 / 0.4), transparent 60%)",
              "radial-gradient(30% 25% at 15% 70%, oklch(0.08 0.02 240 / 0.3), transparent 50%)",
              "radial-gradient(35% 25% at 85% 65%, oklch(0.08 0.02 280 / 0.3), transparent 50%)",
            ].join(","),
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(oklch(0.5 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.5 0 0) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <Outlet />
      </main>
    </div>
  );
}
