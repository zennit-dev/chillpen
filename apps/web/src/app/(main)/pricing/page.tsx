import { resultify } from "@zenncore/utils";
import { CheckIcon } from "@/components/icons";
import { createMetadata } from "@/lib/seo";
import * as Authentication from "@/server/app/authentication";
import { Environment } from "@/server/utils/environment";
import { SubscribeButton } from "./_components/subscribe-button";

export const metadata = createMetadata({
  title: "Pricing",
  description:
    "Read every living universe — a 30-day free trial, then €8/month. Writing is always free.",
  path: "/pricing",
});

const perks = [
  "Unlimited reading across every living universe",
  "Choose your path, save branches, and compare timelines",
  "Follow writers and get notified when their stories grow",
  "Earn coins, win cosmetics, and build your reputation",
] as const;

export default async () => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  const signedIn = proxied.success && proxied.data.success;

  return (
    <main className="px-4 pt-32 pb-24 sm:px-6">
      <div className="mx-auto max-w-md text-center">
        <p className="font-subtitle text-2xs text-primary uppercase tracking-[0.2em]">
          Membership
        </p>
        <h1 className="mt-3 font-display font-semibold text-4xl text-foreground sm:text-5xl">
          Read every world
        </h1>
        <p className="mt-3 font-body text-foreground-dimmed">
          Writing is always free. Readers get a 30-day trial, then €8/month.
        </p>

        <div className="glass mt-10 rounded-2xl p-8 text-left">
          <div className="flex items-baseline gap-1">
            <span className="font-display font-semibold text-5xl text-foreground">
              €8
            </span>
            <span className="font-subtitle text-foreground-dimmed">/month</span>
          </div>
          <p className="mt-1 font-subtitle text-primary text-sm">
            First 30 days free
          </p>

          <ul className="mt-6 space-y-3">
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2.5 font-body text-foreground-rich text-sm"
              >
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                {perk}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <SubscribeButton signedIn={signedIn} />
          </div>
        </div>
      </div>
    </main>
  );
};
