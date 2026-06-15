export const ReadingView = ({
  title,
  body,
  author,
  wordCount,
}: ReadingView.Props) => {
  const paragraphs = body.split(/\n{2,}/).filter(Boolean);
  const minutes = Math.max(1, Math.round(wordCount / 200));

  return (
    <article className="mx-auto max-w-2xl">
      <header className="mb-8 border-white/8 border-b pb-6">
        <h2 className="font-display font-semibold text-2xl text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 font-subtitle text-foreground-dimmed text-sm">
          by <span className="text-foreground-rich">{author ?? "unknown"}</span>{" "}
          · {wordCount} words · {minutes} min read
        </p>
      </header>
      <div className="space-y-6 font-reading text-foreground-rich text-xl leading-[1.85] sm:text-[1.4rem]">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
};

export namespace ReadingView {
  export type Props = {
    title: string;
    body: string;
    author: string | null;
    wordCount: number;
  };
}
