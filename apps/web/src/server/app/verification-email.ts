import { render } from "@react-email/render";
import { Resend } from "resend";
import {
  canDeliverTransactionalEmail,
  isResendSandbox,
} from "@/lib/email-delivery";
import { VerifyEmail } from "@/public/templates/verify";

// Constructed lazily — `new Resend(undefined)` throws, which would crash any
// module that imports this at build time when no key is configured.
const createResend = () => new Resend(process.env.RESEND_API_KEY);

export { isResendSandbox } from "@/lib/email-delivery";

/**
 * Sends the verification email. No-ops when delivery isn't actually possible
 * (missing key / Resend sandbox sender) so callers never hang users behind a
 * link that cannot arrive.
 */
export const sendVerificationEmail = async ({
  to,
  verificationUrl,
}: {
  to: string;
  verificationUrl: string;
}) => {
  if (!canDeliverTransactionalEmail()) {
    console.warn(
      "[resend] skipping verification email — configure a verified-domain FROM_EMAIL",
      { to, sandbox: isResendSandbox() },
    );
    return;
  }

  const resend = createResend();
  const html = await render(
    VerifyEmail({
      verificationUrl,
      userEmail: to,
    }),
  );

  const from = process.env.FROM_EMAIL ?? "";
  if (!from) {
    console.warn("[resend] skipping verification email — FROM_EMAIL unset", {
      to,
    });
    return;
  }

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
      error: result.error,
    });
    throw result.error;
  }
};
