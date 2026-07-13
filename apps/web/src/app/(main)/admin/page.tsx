import { resultify } from "@zenncore/utils";
import { redirect } from "next/navigation";
import * as Admin from "@/server/app/admin";
import * as Authentication from "@/server/app/authentication";
import { Environment } from "@/server/utils/environment";
import { AdminPanel } from "./_components/admin-panel";

export const metadata = { title: "Admin" };

export default async () => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  const user =
    proxied.success && proxied.data.success ? proxied.data.data : null;
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/");

  const [stats, pendingUniverses, pendingChapters, stories, writers] =
    await Promise.all([
      resultify(() => Admin.dashboard(Environment.SERVER)),
      resultify(() => Admin.pendingUniverses(Environment.SERVER)),
      resultify(() => Admin.pendingChapters(Environment.SERVER)),
      resultify(() => Admin.listStories(Environment.SERVER)),
      resultify(() => Admin.topWriters(Environment.SERVER)),
    ]);

  const statsData =
    stats.success && stats.data.success ? stats.data.data : null;
  const pendingUniversesData =
    pendingUniverses.success && pendingUniverses.data.success
      ? pendingUniverses.data.data
      : [];
  const pendingChaptersData =
    pendingChapters.success && pendingChapters.data.success
      ? pendingChapters.data.data
      : [];
  const storiesData =
    stories.success && stories.data.success ? stories.data.data : [];
  const writersData =
    writers.success && writers.data.success ? writers.data.data : [];

  if (!statsData) redirect("/");

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <AdminPanel
          stats={statsData}
          pendingUniverses={pendingUniversesData}
          pendingChapters={pendingChaptersData}
          stories={storiesData}
          writers={writersData}
        />
      </div>
    </main>
  );
};
