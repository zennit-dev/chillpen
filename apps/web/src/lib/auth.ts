import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { sendVerificationEmail } from "@/server/app/verification-email";
import { db, schema } from "@/server/database";

/**
 * better-auth instance backing every `context.auth.*` call in the server layer.
 * Email verification is mandatory (APP.md §6) — writing/earning requires a
 * verified account. Pseudonyms + the chillpen economy columns live on `user`
 * but are managed by repositories, not better-auth, so only the signup-time
 * fields are declared as `additionalFields`.
 */
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
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ to: user.email, verificationUrl: url });
    },
  },
  user: {
    additionalFields: {
      surname: { type: "string", required: true },
      role: { type: "string", required: false, defaultValue: "user" },
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
  ],
});
