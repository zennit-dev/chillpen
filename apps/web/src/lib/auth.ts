import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";
import { canDeliverTransactionalEmail } from "@/lib/email-delivery";
import { sendResetPasswordEmail } from "@/server/app/reset-password-email";
import { sendVerificationEmail } from "@/server/app/verification-email";
import { db, schema } from "@/server/database";

/**
 * better-auth instance backing every `context.auth.*` call in the server layer.
 * Email verification is mandatory once real mail delivery works (APP.md §6) —
 * writing/earning expects a verified account. Until a verified domain
 * `FROM_EMAIL` is configured, Resend cannot deliver to arbitrary inboxes, so
 * we skip the verify wall and auto-admit signups (same as missing API key).
 *
 * Pseudonyms + chillpen economy columns live on `user` but are managed by
 * repositories, not better-auth, so only signup-time fields are declared as
 * `additionalFields`.
 */
const canSendVerificationEmail = canDeliverTransactionalEmail();

export const auth = betterAuth({
  appName: "chillpen",
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.APP_HOST,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: canSendVerificationEmail,
    // Deliver the reset link to our own /reset-password page (built from the
    // token) rather than better-auth's default verify-and-redirect endpoint.
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = `${process.env.APP_HOST}/reset-password?token=${encodeURIComponent(token)}`;
      await sendResetPasswordEmail({ to: user.email, resetUrl });
    },
  },
  emailVerification: {
    sendOnSignUp: canSendVerificationEmail,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ to: user.email, verificationUrl: url });
    },
  },
  user: {
    additionalFields: {
      surname: { type: "string", required: true },
      // Must be returned on session.user — admin gates (`withAuthorization`)
      // and nav `isAdmin` depend on it. `input: false` so signup can't self-elect.
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      jobTitle: { type: "string", required: false },
      company: { type: "string", required: false },
      source: { type: "string", required: false },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "shopify",
          clientId: process.env.SHOPIFY_CLIENT_ID ?? "",
          clientSecret: process.env.SHOPIFY_CLIENT_SECRET ?? "",
          authorizationUrl:
            process.env.SHOPIFY_AUTHORIZATION_URL ??
            "https://shopify.com/admin/oauth/authorize",
          tokenUrl:
            process.env.SHOPIFY_TOKEN_URL ??
            "https://shopify.com/admin/oauth/access_token",
          scopes: ["read_products"],
        },
      ],
    }),
    // MUST be last: bridges better-auth's cookie writes to Next's cookies() so
    // sign-in/sign-up performed inside server actions actually set the session
    // cookie. Without it the session is created in the DB but never delivered to
    // the browser, so every `withAuthentication` action (publishing a universe
    // or chapter, etc.) fails getSession() as Unauthenticated.
    nextCookies(),
  ],
});
