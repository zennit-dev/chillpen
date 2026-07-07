"use server";

import { render } from "@react-email/render";
import { resultify } from "@zenncore/utils";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { Resend } from "resend";
import { VerifyEmail } from "@/public/templates/verify";
import { schema } from "../database";
import { withAuthentication } from "../utils/authentication";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import { InvalidCredentialsError } from "../utils/error";
import { sign, verify } from "../utils/signature";
import * as User from "./user";

// TODO: use betterAuth client instead of server actions (default redirection)

const USER_COOKIE_MAX_AGE = 60 * 60; // 1 hour

const setUserCookie = (
  jar: Awaited<ReturnType<typeof cookies>>,
  user: User.Type,
) =>
  jar.set(
    "user",
    sign(JSON.stringify(user), process.env.BETTER_AUTH_SECRET as string),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: USER_COOKIE_MAX_AGE,
    },
  );

export const signInWithShopify = withContext(
  async (
    context,
    { shop, callbackURL }: { shop: string; callbackURL: string },
  ) => {
    const jar = await cookies();

    const shopifyDomain = shop
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    const normalizedShopifyDomain = shopifyDomain.includes(".myshopify.com")
      ? shopifyDomain
      : `${shopifyDomain}.myshopify.com`;

    jar.set("shopify_auth_shop", normalizedShopifyDomain, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    const result = await resultify(
      async () =>
        await context.auth.signInWithOAuth2({
          body: {
            providerId: "shopify",
            callbackURL,
            // `/onboarding/connect/shopify?shop=${encodeURIComponent(shop)}`
            // TODO: replace with /api/auth/shopify-proxy/authorize
            newUserCallbackURL: `/api/integrations/shopify/install?shop=${encodeURIComponent(shop)}`,
            // additionalData: {
            //   shop,
            // },
          },
        }),
    );

    if (!result.success) {
      return {
        success: false,
        error: new InvalidCredentialsError("Shopify sign-in failed", {
          cause: result.error,
        }),
      };
    }

    if (!result.data.url) {
      return {
        success: false,
        error: new InvalidCredentialsError("Shopify sign-in failed"),
      };
    }

    return { success: true, data: { url: result.data.url } };
  },
  "Authentication.signInWithShopify",
);

export const signInWithGoogle = withContext(
  async (context, { callbackURL }: { callbackURL: string }) => {
    const result = await resultify(
      async () =>
        await context.auth.signInSocial({
          body: {
            provider: "google",
            callbackURL,
            newUserCallbackURL: "/complete-profile",
            disableRedirect: false,
          },
        }),
    );

    if (!result.success) {
      return {
        success: false,
        error: new InvalidCredentialsError("Google sign-in failed", {
          cause: result.error,
        }),
      };
    }

    if (!result.data.url) {
      return {
        success: false,
        error: new InvalidCredentialsError("Google sign-in failed"),
      };
    }

    return { success: true, data: { url: result.data.url } };
  },
  "Authentication.signInWithGoogle",
);

export const signIn = withContext(
  async (context, { email, password }: { email: string; password: string }) => {
    const result = await resultify(async () => {
      const response = await context.auth.signInEmail({
        body: {
          email,
          password,
        },
      });
      return response;
    });

    if (!result.success) {
      return {
        success: false,
        error: new InvalidCredentialsError("Invalid credentials provided", {
          cause: result.error,
        }),
      };
    }

    context.span.addBreadcrumb({
      category: "auth.sign_in",
      data: { "user.id": result.data.user.id, "user.email": email },
    });

    const jar = await cookies();

    setUserCookie(jar, result.data.user as User.Type);

    return { success: true, data: result.data.user };
  },
  "Authentication.signIn",
);

export const signOut = withContext(async (context) => {
  const result = await resultify(
    async () =>
      await context.auth.signOut({
        headers: await headers(),
      }),
  );

  if (!result.success) return result;

  const jar = await cookies();
  jar.delete("user");

  return {
    success: true,
  };
}, "Authentication.signOut");

export const getCurrentUser = withAuthentication(async (context) => {
  return {
    success: true,
    data: context.session.user,
  };
}, "Authentication.getCurrentUser");

export const resetPassword = withContext(
  async (context, { token, password }: { token: string; password: string }) => {
    const { status } = await context.auth.resetPassword({
      body: {
        token,
        newPassword: password,
      },
    });

    if (!status) {
      return {
        success: false,
        error: new Error("reset-password-failed"),
      };
    }

    return { success: true };
  },
  "Authentication.resetPassword",
);

export const forgotPassword = withContext(
  async (context, { email }: { email: string }) => {
    const { status } = await context.auth.requestPasswordReset({
      body: {
        email,
        redirectTo: "/",
      },
    });

    if (!status) {
      return {
        success: false,
        error: new Error("request-password-reset-failed"),
      };
    }

    return {
      success: true,
    };
  },
  "Authentication.forgotPassword",
);

export const getProxiedCurrentUser = withContext(async (context) => {
  const jar = await cookies();
  const cached = jar.get("user")?.value;
  // The signed "user" cookie is only a render-time cache of the profile — it is
  // NOT proof of authentication. Trust it only while a real better-auth session
  // cookie is present (`__Secure-better-auth.session_token` over HTTPS,
  // `better-auth.session_token` in dev). Otherwise a session that was cleared,
  // expired, or predates the nextCookies fix would leave the user "logged in"
  // for page guards but Unauthenticated for every server action (publishing a
  // book/chapter, liking, following…). Falling through to getSession returns
  // null in that case, so guards redirect to /sign-in and a fresh login
  // re-establishes the session — self-healing the desync.
  const hasSessionCookie = jar
    .getAll()
    .some((cookie) => cookie.name.includes("session_token"));
  const payload =
    cached && hasSessionCookie
      ? verify(cached, process.env.BETTER_AUTH_SECRET as string)
      : null;
  const parsed =
    payload !== null ? resultify(() => JSON.parse(payload) as User.Type) : null;
  if (parsed?.success) return { success: true, data: parsed.data };

  const session = await context.auth.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: new Error("user-not-found") };
  }

  const user = await User.get(Environment.SERVER, session.user.id);
  if (!user.success) return user;

  if (!user.data) return { success: false, error: new Error("user-not-found") };

  setUserCookie(jar, user.data);

  return user;
}, "Authentication.getProxiedCurrentUser");

export const changePassword = withAuthentication(
  async (
    context,
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string },
  ) => {
    const result = await resultify(async () =>
      context.auth.changePassword({
        body: {
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        },
      }),
    );

    if (!result.success) {
      return {
        success: false,
        error: new InvalidCredentialsError("Current password is incorrect", {
          cause: result.error,
        }),
      };
    }

    return { success: true };
  },
  "Authentication.changePassword",
);

export const doesEmailExist = withContext(
  async (_, { email }: { email: string }) => {
    const users = await User.find(Environment.SERVER, {
      where: eq(schema.user.email, email),
    });

    if (!users.success) return users;
    return { success: true, data: users.data.length > 0 };
  },
  "Authentication.getDoesEmailExist",
);

const TRIAL_MS = 30 * 24 * 60 * 60 * 1000;

export const signUp = withContext(
  async (
    context,
    payload: {
      pseudonym: string;
      email: string;
      password: string;
    },
  ) => {
    // Pseudonyms are the identity (APP.md §5.6) — claim it up front and reject
    // collisions before creating the account.
    const taken = await User.find(Environment.SERVER, {
      where: eq(schema.user.pseudonym, payload.pseudonym),
      limit: 1,
    });
    if (taken.success && taken.data[0])
      return {
        success: false as const,
        error: new InvalidCredentialsError("That pseudonym is already taken"),
      };

    // Reject duplicate emails up front with a clear message instead of letting
    // better-auth surface a generic "sign up failed".
    const existingEmail = await User.find(Environment.SERVER, {
      where: eq(schema.user.email, payload.email.toLowerCase()),
      limit: 1,
    });
    if (existingEmail.success && existingEmail.data[0])
      return {
        success: false as const,
        error: new InvalidCredentialsError(
          "An account with this email already exists",
        ),
      };

    const result = await resultify(
      async () =>
        await context.auth.signUpEmail({
          body: {
            name: payload.pseudonym,
            surname: payload.pseudonym,
            email: payload.email,
            password: payload.password,
            callbackURL: `${process.env.APP_HOST}/verify/success`,
            role: "user",
          },
        }),
    );

    if (!result.success) {
      return {
        success: false as const,
        error: new InvalidCredentialsError(
          result.error?.message ?? "Sign up failed",
          { cause: result.error },
        ),
      };
    }

    context.span.addBreadcrumb({
      category: "auth.sign_up",
      data: { "user.email": payload.email },
    });

    // Set the pseudonym + open the 30-day reading trial on the fresh account.
    await User.update(Environment.SERVER, result.data.user.id, {
      pseudonym: payload.pseudonym,
      subscriptionStatus: "trial",
      trialEndsAt: new Date(Date.now() + TRIAL_MS),
    });

    // Without a real Resend key we never send a verification email, so
    // better-auth returns a usable session — sign the user in directly so they
    // can continue to the payment step. Mirrors signIn.
    const canSendVerificationEmail =
      (process.env.RESEND_API_KEY ?? "").length > 20;

    if (!canSendVerificationEmail) {
      const jar = await cookies();
      const fresh = await User.get(Environment.SERVER, result.data.user.id);
      setUserCookie(
        jar,
        fresh.success && fresh.data
          ? fresh.data
          : (result.data.user as User.Type),
      );
      return { success: true as const, data: { verified: true } };
    }

    return { success: true as const, data: { verified: false } };
  },
  "Authentication.signUp",
);

export const verifyEmail = withContext(async (_context, token: string) => {
  const callbackUrl = `${process.env.APP_HOST}/verify/success`;
  const redirectUrl = `${process.env.APP_HOST}/api/auth/verify-email?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callbackUrl)}`;
  return {
    success: true,
    data: { redirectUrl },
  };
}, "Authentication.verifyEmail");

// Constructed lazily — `new Resend(undefined)` throws at import when no key is
// configured, which would crash the build during page-data collection.
const createResend = () => new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the verification email. Do not await in the caller to avoid timing attacks.
 */
export const sendVerificationEmail = async ({
  to,
  verificationUrl,
}: {
  to: string;
  verificationUrl: string;
}) => {
  const resend = createResend();
  const html = await render(
    VerifyEmail({
      verificationUrl,
      userEmail: to,
    }),
  );

  const result = await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    subject: "Verify your email address",
    html,
  });

  if (result.error) throw result.error;
};
