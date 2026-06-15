import type { ReactNode } from "react";
import { Logo } from "@/components/ui";

export default ({ children }: { children: ReactNode }) => (
  <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
    <div className="-z-10 absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
    <Logo className="mb-8 text-2xl" />
    <div className="w-full max-w-sm">{children}</div>
  </main>
);
