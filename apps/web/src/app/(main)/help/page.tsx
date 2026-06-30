import type { ReactNode } from "react";
import { Logo } from "@/components/ui";

export const metadata = {
  title: "Help",
  description:
    "How chillpen works — publishing, saving, accounts, and billing.",
};

const faqs: { question: string; answer: ReactNode }[] = [
  {
    question: "How does publishing a chapter work?",
    answer: (
      <>
        Write in the Studio, then <strong>Submit for review</strong>. An editor
        approves it before it joins the universe. Chapters must be{" "}
        <strong>500–4,000 words</strong>:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Under 500</strong> — too short to publish; add more story.
          </li>
          <li>
            <strong>800–1,500</strong> — the recommended sweet spot.
          </li>
          <li>
            <strong>Over 2,500</strong> — consider splitting into two parts.
          </li>
          <li>
            <strong>Over 4,000</strong> — split into multiple chapters before
            submitting.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "How do branching stories work?",
    answer:
      "A book is a living universe. Any writer can branch their own next chapter off an existing one, growing the story into a tree. Readers choose their own path through it.",
  },
  {
    question: "I saved a story — where did it go?",
    answer: (
      <>
        Tap the heart on any cover to save it. Everything you save lands in your{" "}
        <strong>Library</strong>, reachable from the top nav or your account
        menu.
      </>
    ),
  },
  {
    question: "What does a subscription include, and how is billing handled?",
    answer: (
      <>
        Reading is <strong>€8/month after a 30-day free trial</strong>. Writing
        is always free and earns coins. Manage your card, invoices, and
        cancellation any time from{" "}
        <strong>Account settings → Subscription &amp; payment</strong>.
      </>
    ),
  },
  {
    question: "How do I change my pseudonym, email, or password?",
    answer: (
      <>
        Open the account menu (top-right) and choose{" "}
        <strong>Account settings</strong>. You can update your avatar,
        pseudonym, email, and password there.
      </>
    ),
  },
  {
    question: "Still stuck?",
    answer: (
      <>
        Email us at{" "}
        <a
          href="mailto:support@chillpen.club"
          className="text-primary hover:text-primary-rich"
        >
          support@chillpen.club
        </a>{" "}
        and we'll help you out.
      </>
    ),
  },
];

export default () => (
  <main className="px-4 pt-28 pb-20 sm:px-6">
    <div className="mx-auto max-w-2xl">
      <Logo className="mb-6" />
      <h1 className="font-display font-semibold text-3xl text-foreground">
        Help &amp; FAQ
      </h1>
      <p className="mt-1 font-body text-foreground-dimmed">
        Everything you need to read, write, and build worlds on chillpen.
      </p>

      <div className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <section
            key={faq.question}
            className="rounded-2xl border border-white/8 bg-background-rich p-5 sm:p-6"
          >
            <h2 className="font-display font-medium text-foreground text-lg">
              {faq.question}
            </h2>
            <div className="mt-2 font-body text-foreground-rich text-sm leading-relaxed">
              {faq.answer}
            </div>
          </section>
        ))}
      </div>
    </div>
  </main>
);
