"use server";

import { resultify } from "@zenncore/utils";
import { eq } from "drizzle-orm";
import { schema } from "../database";
import { withAuthentication } from "../utils/authentication";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import { stripe } from "../utils/stripe";
import * as User from "./user";

const TRIAL_MS = 30 * 24 * 60 * 60 * 1000;

export const status = withAuthentication(async (context) => {
  const account = await User.get(Environment.SERVER, context.session.user.id);
  if (!account.success) return account;
  return {
    success: true as const,
    data: {
      status: account.data?.subscriptionStatus ?? "trial",
      trialEndsAt: account.data?.trialEndsAt ?? null,
    },
  };
}, "Subscription.status");

export const startTrial = withAuthentication(async (context) => {
  const trialEndsAt = new Date(Date.now() + TRIAL_MS);
  return User.update(Environment.SERVER, context.session.user.id, {
    subscriptionStatus: "trial",
    trialEndsAt,
  });
}, "Subscription.startTrial");

export const checkout = withAuthentication(async (context) => {
  const result = await resultify(() =>
    stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_SUB_READER, quantity: 1 }],
      success_url: `${process.env.APP_HOST}/me?checkout=success`,
      cancel_url: `${process.env.APP_HOST}/pricing`,
      customer_email: context.session.user.email,
      subscription_data: { trial_period_days: 30 },
    }),
  );
  if (!result.success) return result;
  if (!result.data.url)
    return { success: false as const, error: new Error("checkout-failed") };
  return { success: true as const, data: { url: result.data.url } };
}, "Subscription.checkout");

export const syncFromWebhook = withContext(
  async (
    _,
    input: { customer: string; status: string; subscription?: string },
  ) => {
    const users = await User.find(Environment.SERVER, {
      where: eq(schema.user.stripeCustomerId, input.customer),
      limit: 1,
    });
    if (!users.success) return users;

    const account = users.data[0];
    if (!account) return { success: true as const, data: null };

    return User.update(Environment.SERVER, account.id, {
      subscriptionStatus: input.status,
      stripeSubscriptionId: input.subscription,
    });
  },
  "Subscription.syncFromWebhook",
);
