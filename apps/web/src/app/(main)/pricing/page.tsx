import { resultify } from "@zenncore/utils";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@zenncore/web/components/accordion";
import { CheckIcon } from "@/components/icons";
import { createFaqSchema, createMetadata } from "@/lib/seo";
import * as Authentication from "@/server/app/authentication";
import { Environment } from "@/server/utils/environment";
import { SubscribeButton } from "./_components/subscribe-button";

export const metadata = createMetadata({
  title: "Pricing",
  description:
    "Read every living universe — a 30-day free trial, then €8/month. Writing is always free.",
  path: "/pricing",
});

const perks = [
  "Unlimited reading across every living universe",
  "Choose your path, save branches, and compare timelines",
  "Follow writers and get notified when their stories grow",
  "Earn coins, win cosmetics, and build your reputation",
] as const;

const faqs = [
  {
    question: "Is writing free?",
    answer:
      "Always. Writing chapters, branching universes, and earning coins is free forever. The €8/month is only for unlimited reading.",
  },
  {
    question: "What's in the free trial?",
    answer:
      "Thirty days of unlimited reading across every living universe — every branch, every timeline. You're not charged until it ends.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, from your dashboard. You keep full access until the end of your billing period.",
  },
  {
    question: "How do writers earn?",
    answer:
      "Approved chapters, reader engagement, likes, and challenge wins all earn coins you spend on cosmetics in the Avatar Studio.",
  },
  {
    question: "Do I need to subscribe to read?",
    answer:
      "You can browse and sample freely. Reading the full catalog and saving paths needs an active trial or subscription.",
  },
] as const;

export default async () => {
  const proxied = await resultify(() =>
    Authentication.getProxiedCurrentUser(Environment.SERVER),
  );
  const signedIn = proxied.success && proxied.data.success;

  return (
    <main className="px-4 pt-32 pb-24 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createFaqSchema(faqs)),
        }}
      />
      <div className="mx-auto max-w-md text-center">
        <p className="font-subtitle text-2xs text-primary uppercase tracking-[0.2em]">
          Membership
        </p>
        <h1 className="mt-3 font-display font-semibold text-4xl text-foreground sm:text-5xl">
          Read every world
        </h1>
        <p className="mt-3 font-body text-foreground-dimmed">
          Writing is always free. Readers get a 30-day trial, then €8/month.
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-background-rich p-8 text-left">
          <div className="flex items-baseline gap-1">
            <span className="font-display font-semibold text-5xl text-foreground">
              €8
            </span>
            <span className="font-subtitle text-foreground-dimmed">/month</span>
          </div>
          <p className="mt-1 font-subtitle text-primary text-sm">
            First 30 days free
          </p>

          <ul className="mt-6 space-y-3">
            {perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2.5 font-body text-foreground-rich text-sm"
              >
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                {perk}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <SubscribeButton signedIn={signedIn} />
          </div>
        </div>
      </div>

      <section className="mx-auto mt-20 max-w-2xl">
        <h2 className="mb-6 text-center font-display font-semibold text-2xl text-foreground sm:text-3xl">
          Questions
        </h2>
        <Accordion>
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} className="border-white/8">
              <AccordionTrigger className="py-4 font-display font-medium text-base text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionPanel>
                <p className="pb-4 font-body text-foreground-dimmed text-sm leading-relaxed">
                  {faq.answer}
                </p>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  );
};
