import { resultify } from "@zenncore/utils";
import { redirect } from "next/navigation";
import { CheckIcon } from "@/components/icons";
import * as Authentication from "@/server/app/authentication";
import { Environment } from "@/server/utils/environment";
import { PaymentStep } from "./_components/payment-step";

export const metadata = { title: "Add payment" };

const perks = [
  "Unlimited reading across every living universe",
  "Choose your path, save branches, compare timelines",
  "Follow writers, get notified when their stories grow",
] as const;

export default async () => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  if (!proxied.success || !proxied.data.success) redirect("/sign-in");

  return (
    <div>
      <header className="mb-6">
        <p className="font-medium font-subtitle text-2xs text-primary uppercase tracking-[0.2em]">
          Step 2 of 2 · Membership
        </p>
        <h1 className="mt-2 font-display font-semibold text-3xl text-foreground">
          Start your free month
        </h1>
        <p className="mt-1 font-body text-foreground-dimmed text-sm">
          Add a card to unlock every world. No charge for 30 days — cancel
          anytime before it ends.
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-baseline gap-1">
          <span className="font-display font-semibold text-4xl text-foreground">
            €8
          </span>
          <span className="font-subtitle text-foreground-dimmed">/month</span>
        </div>
        <p className="mt-1 font-subtitle text-primary text-sm">
          First 30 days free
        </p>

        <ul className="mt-5 space-y-2.5">
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

        <div className="mt-6">
          <PaymentStep />
        </div>
      </div>
    </div>
  );
};
