import { resultify } from "@zenncore/utils";
import * as Authentication from "@/server/app/authentication";
import * as Genre from "@/server/app/genre";
import { Environment } from "@/server/utils/environment";
import { Footer } from "./_components/footer";
import { NavBar, type NavGenre, type NavUser } from "./_components/nav-bar";

export default async ({ children }: LayoutProps<"/">) => {
  const [proxied, genres] = await Promise.all([
    resultify(() => Authentication.getProxiedCurrentUser(Environment.SERVER)),
    Genre.list(Environment.SERVER),
  ]);

  const account =
    proxied.success && proxied.data.success ? proxied.data.data : null;
  const user: NavUser | null = account
    ? {
        pseudonym: account.pseudonym ?? account.name,
        coins: account.coins,
        avatar: account.avatarConfig?.preset ?? null,
        image: account.image ?? null,
      }
    : null;
  const navGenres: NavGenre[] = genres.success
    ? genres.data.map((genre) => ({
        slug: genre.slug,
        name: genre.name,
        accent: genre.accent,
      }))
    : [];

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar user={user} genres={navGenres} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
};
