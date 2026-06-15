import { cn } from "@zenncore/utils";
import Link from "next/link";
import { formatCount } from "@/components/ui";
import type * as Chapter from "@/server/app/chapter";

type Node = Chapter.ChapterNode;

export const BranchMap = ({ slug, nodes }: BranchMap.Props) => {
  if (nodes.length === 0)
    return (
      <p className="font-body text-foreground-dimmed">
        This universe has no branches yet.
      </p>
    );

  const byParent = new Map<string, Node[]>();
  for (const node of nodes) {
    const key = node.parentChapterId ?? "root";
    byParent.set(key, [...(byParent.get(key) ?? []), node]);
  }
  const heatCeiling = Math.max(1, ...nodes.map((node) => node.readCount));
  const roots = byParent.get("root") ?? [];

  return (
    <div className="space-y-3">
      {roots.map((node) => (
        <Branch
          key={node.id}
          node={node}
          byParent={byParent}
          slug={slug}
          ceiling={heatCeiling}
        />
      ))}
    </div>
  );
};

export namespace BranchMap {
  export type Props = {
    slug: string;
    nodes: Node[];
  };
}

const Branch = ({
  node,
  byParent,
  slug,
  ceiling,
}: {
  node: Node;
  byParent: Map<string, Node[]>;
  slug: string;
  ceiling: number;
}) => {
  const children = byParent.get(node.id) ?? [];
  const heat = node.readCount / ceiling;

  return (
    <div>
      <Link
        href={`/story/${slug}/read/${node.id}`}
        className={cn(
          "flex items-center gap-3 rounded-[6px] border bg-background-rich p-3 transition hover:border-primary/40 hover:bg-white/[0.03]",
          heat > 0.66
            ? "border-primary/40"
            : heat > 0.33
              ? "border-primary/20"
              : "border-white/8",
        )}
      >
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor: `color-mix(in oklab, var(--color-primary) ${Math.round(
              20 + heat * 80,
            )}%, var(--color-accent-rich))`,
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-medium text-foreground text-sm">
            {node.title}
          </p>
          {node.summary ? (
            <p className="truncate font-body text-foreground-dimmed text-xs">
              {node.summary}
            </p>
          ) : null}
        </div>
        <span className="hidden shrink-0 font-subtitle text-2xs text-foreground-dimmed sm:block">
          {formatCount(node.readCount)} reads · {node.forkCount} forks
        </span>
      </Link>

      {children.length > 0 ? (
        <div className="mt-3 ml-4 space-y-3 border-white/10 border-l pl-4 sm:ml-5 sm:pl-5">
          {children.map((child) => (
            <Branch
              key={child.id}
              node={child}
              byParent={byParent}
              slug={slug}
              ceiling={ceiling}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
