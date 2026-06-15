import { Suspense } from "react";
import * as Chapter from "@/server/app/chapter";
import { Environment } from "@/server/utils/environment";
import { BranchChoice } from "./branch-choice";

type Props = { slug: string; universe: string; chapter: string };

export const Continuations = (props: Props) => (
  <Suspense fallback={null}>
    <Resolver {...props} />
  </Suspense>
);

async function Resolver({ slug, universe, chapter }: Props) {
  const result = await Chapter.continuations(Environment.SERVER, { chapter });
  const branches = result.success
    ? result.data.map((branch) => ({
        id: branch.id,
        title: branch.title,
        author: branch.author,
        readCount: branch.readCount,
        forkCount: branch.forkCount,
        likeCount: branch.likeCount,
      }))
    : [];
  return (
    <BranchChoice
      slug={slug}
      universe={universe}
      chapter={chapter}
      branches={branches}
    />
  );
}
