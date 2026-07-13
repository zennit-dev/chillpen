import { resultify } from "@zenncore/utils";
import { redirect } from "next/navigation";
import { CoinIcon } from "@/components/icons";
import * as Authentication from "@/server/app/authentication";
import * as AvatarStudio from "@/server/app/avatar-studio";
import { Environment } from "@/server/utils/environment";
import { AvatarStudioPanel } from "./_components/avatar-studio";

export const metadata = { title: "Avatar Studio" };

export default async () => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  const user =
    proxied.success && proxied.data.success ? proxied.data.data : null;
  if (!user) redirect("/sign-in");

  const wallet = await resultify(() => AvatarStudio.wallet(Environment.SERVER));
  if (!wallet.success || !wallet.data.success) redirect("/me");

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-subtitle text-2xs text-primary uppercase tracking-[0.2em]">
              Identity
            </p>
            <h1 className="mt-1 font-display font-semibold text-3xl text-foreground">
              Avatar studio
            </h1>
            <p className="mt-2 font-body text-foreground-dimmed">
              Write. Earn coins. Unlock. Customize. Express you.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-medium font-subtitle text-primary text-sm">
            <CoinIcon className="size-4" />
            {wallet.data.data.coins}
          </span>
        </header>

        <AvatarStudioPanel
          pseudonym={user.pseudonym ?? user.name}
          wallet={wallet.data.data}
        />
      </div>
    </main>
  );
};
