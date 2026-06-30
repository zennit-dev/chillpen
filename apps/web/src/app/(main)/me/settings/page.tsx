import { resultify } from "@zenncore/utils";
import { redirect } from "next/navigation";
import * as Authentication from "@/server/app/authentication";
import { Environment } from "@/server/utils/environment";
import { AccountSettings } from "./_components/account-settings";

export const metadata = { title: "Account settings" };

export default async () => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  const user =
    proxied.success && proxied.data.success ? proxied.data.data : null;
  if (!user) redirect("/sign-in");

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display font-semibold text-3xl text-foreground">
          Account settings
        </h1>
        <p className="mt-1 font-body text-foreground-dimmed">
          Manage your identity, security, and subscription.
        </p>
        <div className="mt-8">
          <AccountSettings
            pseudonym={user.pseudonym ?? user.name}
            email={user.email}
            avatar={user.avatarConfig?.preset ?? null}
            subscriptionStatus={user.subscriptionStatus}
          />
        </div>
      </div>
    </main>
  );
};
