"use server";

import { render } from "@react-email/render";
import { resultify } from "@zenncore/utils";
import { isAPIError } from "better-auth/api";
import { and, eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { Resend } from "resend";
import { VerifyEmail } from "@/public/templates/verify";
import { db, schema } from "../database";
import { withAuthentication } from "../utils/authentication";
import { withContext } from "../utils/context";
import { Environment } from "../utils/environment";
import { InvalidCredentialsError } from "../utils/error";
import { sign } from "../utils/signature";
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

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const signInFailure = (message: string) => ({
  success: false as const,
  error: new InvalidCredentialsError(message),
});

const hasCredentialAccount = async (user: string) => {
  const rows = await db
    .select({
      id: schema.account.id,
      password: schema.account.password,
    })
    .from(schema.account)
    .where(
      and(
        eq(schema.account.userId, user),
        eq(schema.account.providerId, "credential"),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
};

export const signIn = withContext(
  async (context, { email, password }: { email: string; password: string }) => {
    const address = normalizeEmail(email);

    const users = await User.find(Environment.SERVER, {
      where: eq(schema.user.email, address),
      limit: 1,
    });
    if (!users.success) return users;

    if (!users.data[0])
      return signInFailure(
        "No account found for this email. Create one below or try another address.",
      );

    const credential = await hasCredentialAccount(users.data[0].id);
    if (!credential || !credential.password)
      return signInFailure(
        "This account has no password yet. Use Forgot password to set one — or contact support if reset email isn’t configured.",
      );

    try {
      const response = await context.auth.signInEmail({
        body: {
          email: address,
          password,
        },
      });

      context.span.addBreadcrumb({
        category: "auth.sign_in",
        data: { "user.id": response.user.id, "user.email": address },
      });

      const jar = await cookies();
      const profile = await User.get(Environment.SERVER, response.user.id);
      setUserCookie(
        jar,
        profile.success && profile.data
          ? profile.data
          : (response.user as User.Type),
      );

      return {
        success: true as const,
        data:
          profile.success && profile.data
            ? profile.data
            : (response.user as User.Type),
      };
    } catch (error) {
      if (isAPIError(error)) {
        const code = error.body?.code;
        if (code === "EMAIL_NOT_VERIFIED")
          return signInFailure(
            "Verify your email before signing in. Check your inbox for the verification link.",
          );
        if (code === "INVALID_EMAIL_OR_PASSWORD")
          return signInFailure("Incorrect password for this email.");
      }

      return signInFailure(
        "Could not sign in. Check your email and password, or reset your password.",
      );
    }
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
  // Read-only in Server Components — never mutate cookies here. Always load the
  // full Drizzle profile (including `role`) so Admin nav /admin gate stay
  // correct. The signed "user" cookie is only written from server actions.
  const hasSessionCookie = jar
    .getAll()
    .some((cookie) => cookie.name.includes("session_token"));

  if (!hasSessionCookie) {
    return { success: false, error: new Error("user-not-found") };
  }

  const session = await context.auth.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: new Error("user-not-found") };
  }

  const user = await User.get(Environment.SERVER, session.user.id);
  if (!user.success) return user;

  if (!user.data) return { success: false, error: new Error("user-not-found") };

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
      where: eq(schema.user.email, normalizeEmail(email)),
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
    const email = normalizeEmail(payload.email);
    const pseudonym = payload.pseudonym.trim();

    const taken = await User.find(Environment.SERVER, {
      where: eq(schema.user.pseudonym, pseudonym),
      limit: 1,
    });
    if (taken.success && taken.data[0])
      return signInFailure("That pseudonym is already taken — try another.");

    const existingEmail = await User.find(Environment.SERVER, {
      where: eq(schema.user.email, email),
      limit: 1,
    });
    if (existingEmail.success && existingEmail.data[0])
      return signInFailure("An account with this email already exists.");

    try {
      const response = await context.auth.signUpEmail({
        body: {
          name: pseudonym,
          surname: pseudonym,
          email,
          password: payload.password,
          callbackURL: `${process.env.APP_HOST}/verify/success`,
        },
      });

      context.span.addBreadcrumb({
        category: "auth.sign_up",
        data: { "user.email": email },
      });

      await User.update(Environment.SERVER, response.user.id, {
        pseudonym,
        role: "user",
        subscriptionStatus: "trial",
        trialEndsAt: new Date(Date.now() + TRIAL_MS),
        avatarConfig: {
          preset: "bird",
          ownedAvatars: ["bird"],
          ownedItems: [],
          equipped: {},
        },
      });

      const canSendVerificationEmail =
        (process.env.RESEND_API_KEY ?? "").length > 20;

      if (!canSendVerificationEmail) {
        const jar = await cookies();
        const fresh = await User.get(Environment.SERVER, response.user.id);
        setUserCookie(
          jar,
          fresh.success && fresh.data
            ? fresh.data
            : (response.user as User.Type),
        );
        return { success: true as const, data: { verified: true } };
      }

      return { success: true as const, data: { verified: false } };
    } catch (error) {
      if (isAPIError(error)) {
        const code = error.body?.code;
        const message = error.body?.message ?? error.message;
        if (
          code === "USER_ALREADY_EXISTS" ||
          code === "EMAIL_ALREADY_EXISTS" ||
          /email/i.test(message)
        )
          return signInFailure("An account with this email already exists.");
      }

      return signInFailure(
        error instanceof Error
          ? error.message
          : "Could not create your account. Try a different email or pseudonym.",
      );
    }
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
