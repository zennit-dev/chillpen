import { resultify } from "@zenncore/utils";
import { redirect } from "next/navigation";
import * as Authentication from "@/server/app/authentication";
import * as Cosmetic from "@/server/app/cosmetic";
import { Environment } from "@/server/utils/environment";
import { AvatarStudio } from "./_components/avatar-studio";

export const metadata = { title: "Avatar Studio" };

export default async () => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  const user =
    proxied.success && proxied.data.success ? proxied.data.data : null;
  if (!user) redirect("/sign-in");

  const [shop, inventory] = await Promise.all([
    Cosmetic.shop(Environment.SERVER),
    resultify(() => Cosmetic.inventory(Environment.SERVER)),
  ]);

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="font-display font-semibold text-3xl text-foreground">
            Avatar Studio
          </h1>
          <p className="mt-2 font-body text-foreground-dimmed">
            Spend coins, equip cosmetics, and flex the rare items you've won.
          </p>
        </header>

        <AvatarStudio
          coins={user.coins}
          shop={shop.success ? shop.data : []}
          owned={
            inventory.success && inventory.data.success
              ? inventory.data.data
              : []
          }
        />
      </div>
    </main>
  );
};
