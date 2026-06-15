import Link from "next/link";
import { notFound } from "next/navigation";
import { BranchIcon } from "@/components/icons";
import * as Chapter from "@/server/app/chapter";
import * as Universe from "@/server/app/universe";
import { Environment } from "@/server/utils/environment";
import { BranchMap } from "../_components/branch-map";

type Params = { params: Promise<{ slug: string }> };

export default async ({ params }: Params) => {
  const { slug } = await params;
  const universe = await Universe.bySlug(Environment.SERVER, slug);
  if (!universe.success || !universe.data) notFound();

  const tree = await Chapter.tree(Environment.SERVER, {
    universe: universe.data.id,
  });
  const nodes = tree.success ? tree.data : [];

  return (
    <main className="px-4 pt-28 pb-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/story/${slug}`}
          className="font-subtitle text-foreground-dimmed text-sm transition hover:text-foreground"
        >
          ← {universe.data.title}
        </Link>
        <header className="mt-4 mb-8 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
            <BranchIcon className="size-5" />
          </span>
          <div>
            <h1 className="font-display font-semibold text-2xl text-foreground sm:text-3xl">
              Universe map
            </h1>
            <p className="font-subtitle text-foreground-dimmed text-sm">
              {nodes.length} branches · brighter nodes are the most-read paths
            </p>
          </div>
        </header>
        <BranchMap slug={slug} nodes={nodes} />
      </div>
    </main>
  );
};
