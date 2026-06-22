import Image from "next/image";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui";

// Split-screen cinematic shell: the form on the left, a book-cover hero on the
// right — the way readers first meet a world. Falls back to a single column on
// small screens.
export default ({ children }: { children: ReactNode }) => (
  <main className="grid min-h-screen lg:grid-cols-2">
    <div className="relative flex flex-col justify-center px-6 py-16 sm:px-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-30%] left-1/4 size-[520px] rounded-full bg-primary/10 blur-[160px]" />
      </div>
      <Logo className="absolute top-8 left-6 text-xl sm:left-10" />
      <div className="mx-auto w-full max-w-sm">{children}</div>
    </div>

    <aside className="relative hidden overflow-hidden lg:block">
      <Image
        src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&q=80"
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/10 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      <div className="absolute bottom-12 left-12 right-12">
        <p className="font-medium font-subtitle text-2xs text-primary uppercase tracking-[0.3em]">
          chillpen.club
        </p>
        <p className="mt-3 max-w-sm font-reading text-3xl text-foreground italic leading-snug">
          Every world begins with someone brave enough to write the first line.
        </p>
      </div>
    </aside>
  </main>
);
