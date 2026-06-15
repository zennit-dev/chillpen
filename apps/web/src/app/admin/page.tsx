import { resultify } from "@zenncore/utils";
import { redirect } from "next/navigation";
import * as Authentication from "@/server/app/authentication";
import * as Moderation from "@/server/app/moderation";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";
import { FeaturedManager } from "./_components/featured-manager";
import { ModerationQueue } from "./_components/moderation-queue";

export const metadata = { title: "Admin" };

export default async () => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  const user =
    proxied.success && proxied.data.success ? proxied.data.data : null;
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/");

  const [universes, queue] = await Promise.all([
    Universe.trending(Environment.SERVER, { size: 50 }),
    resultify(() =>
      Moderation.queue(Environment.SERVER, { page: 1, size: 30 }),
    ),
  ]);

  const cards = universes.success ? universes.data : [];
  const pending =
    queue.success && queue.data.success ? queue.data.data.items : [];

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-12">
        <header>
          <p className="font-subtitle text-2xs text-primary uppercase tracking-widest">
            Curator
          </p>
          <h1 className="mt-1 font-display font-semibold text-3xl text-foreground">
            Control room
          </h1>
        </header>
        <FeaturedManager universes={cards} />
        <ModerationQueue items={pending} />
      </div>
    </main>
  );
};
