"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import Link from "next/link";
import { useState } from "react";
import * as Comment from "@/server/app/comment";

export type CommentView = {
  id: string;
  body: string;
  author: string;
  image: string | null;
};

export const Comments = ({ profile, initial, signedIn }: Comments.Props) => {
  const [comments, setComments] = useState<CommentView[]>(initial);
  const [draft, setDraft] = useState("");

  const [post, isPending] = useAsyncAction(async () => {
    const body = draft.trim();
    if (body.length === 0) return;
    const result = await Comment.post({
      targetType: "profile",
      target: profile,
      body,
    });
    if (!result.success) return;
    setComments((current) => [
      { id: result.data.id, body, author: "You", image: null },
      ...current,
    ]);
    setDraft("");
  });

  return (
    <div className="space-y-5">
      {signedIn ? (
        <div className="rounded-xl border border-white/8 bg-background-rich p-4">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            maxLength={600}
            placeholder="Congratulate this writer or leave a note about their work…"
            className="w-full resize-none rounded-md border border-accent-foreground bg-white/[0.02] px-3 py-2 font-body text-foreground text-sm outline-none transition focus:border-primary/45"
          />
          <div className="mt-2 flex justify-end">
            <Button
              color="primary"
              disabled={isPending || draft.trim().length === 0}
              onClick={() => void post()}
            >
              Post comment
            </Button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-white/8 bg-background-rich p-4 font-body text-foreground-dimmed text-sm">
          <Link href="/sign-in" className="text-primary">
            Sign in
          </Link>{" "}
          to leave a comment for this writer.
        </p>
      )}

      {comments.length > 0 ? (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="flex gap-3 rounded-xl border border-white/8 bg-background-rich p-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display font-semibold text-primary text-sm">
                {comment.author.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="font-display font-medium text-foreground text-sm">
                  {comment.author}
                </p>
                <p className="mt-0.5 font-body text-foreground-rich text-sm leading-relaxed">
                  {comment.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-body text-foreground-dimmed text-sm">
          No comments yet. Be the first to cheer them on.
        </p>
      )}
    </div>
  );
};

export namespace Comments {
  export type Props = {
    profile: string;
    initial: CommentView[];
    signedIn: boolean;
  };
}
