import type { ReactNode } from "react";
import { Logo } from "@/components/ui";

export default ({ children }: { children: ReactNode }) => (
  <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background-dimmed via-background to-background-dimmed" />
      <div className="absolute top-[-30%] left-1/2 size-[680px] -translate-x-1/2 rounded-full bg-primary/12 blur-[150px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.7))]" />
    </div>
    <Logo className="mb-8 text-2xl" />
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-background-rich/80 p-8 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      {children}
    </div>
  </main>
);
