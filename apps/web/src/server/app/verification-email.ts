import { render } from "@react-email/render";
import { Resend } from "resend";
import { VerifyEmail } from "@/public/templates/verify";

// Constructed lazily — `new Resend(undefined)` throws, which would crash any
// module that imports this at build time when no key is configured.
const createResend = () => new Resend(process.env.RESEND_API_KEY);

/** True while using Resend's shared test sender — only the Resend account owner can receive mail. */
export const isResendSandbox = () =>
  (process.env.FROM_EMAIL ?? "onboarding@resend.dev").includes(
    "onboarding@resend.dev",
  );

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

  const from = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  const result = await resend.emails.send({
    from,
    to,
    subject: "Verify your email address",
    html,
  });

  if (result.error) {
    console.error("[resend] verification email failed", {
      to,
      from,
      sandbox: isResendSandbox(),
      error: result.error,
    });
    throw result.error;
  }
};
