import { resultify } from "@zenncore/utils";
import * as Subscription from "@/server/app/subscription";
import { Environment } from "@/server/utils/environment";
import { stripe } from "@/server/utils/stripe";

export const POST = async (request: Request) => {
  const signature = request.headers.get("stripe-signature");
  if (!signature)
    return new Response("Missing stripe-signature header", { status: 400 });

  const body = await request.text();
  const verified = resultify(() =>
    stripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    ),
  );
  if (!verified.success)
    return new Response("Invalid signature", { status: 400 });

  const event = verified.data;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as {
        customer: string | null;
        client_reference_id: string | null;
        subscription: string | null;
      };
      if (session.customer && session.client_reference_id)
        await Subscription.linkCustomer(Environment.SERVER, {
          user: session.client_reference_id,
          customer: session.customer,
          subscription: session.subscription ?? undefined,
        });
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as {
        id: string;
        customer: string;
        status: string;
      };
      const active =
        subscription.status === "active" || subscription.status === "trialing";
      await Subscription.syncFromWebhook(Environment.SERVER, {
        customer: subscription.customer,
        status: active ? "active" : "canceled",
        subscription: subscription.id,
      });
      break;
    }
  }

  return new Response("ok", { status: 200 });
};
