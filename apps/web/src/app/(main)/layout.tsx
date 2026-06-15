import { resultify } from "@zenncore/utils";
import * as Authentication from "@/server/app/authentication";
import { Environment } from "@/server/utils/environment";
import { Footer } from "./_components/footer";
import { NavBar, type NavUser } from "./_components/nav-bar";

export default async ({ children }: LayoutProps<"/">) => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  const account =
    proxied.success && proxied.data.success ? proxied.data.data : null;
  const user: NavUser | null = account
    ? { pseudonym: account.pseudonym ?? account.name, coins: account.coins }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar user={user} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
};
