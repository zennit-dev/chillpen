import { render } from "@react-email/render";
import { Resend } from "resend";
import {
  canDeliverTransactionalEmail,
  isResendSandbox,
} from "@/lib/email-delivery";
import { ResetPasswordEmail } from "@/public/templates/reset";

// Constructed lazily — `new Resend(undefined)` throws, which would crash any
// module that imports this at build time when no key is configured.
const createResend = () => new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the password-reset email. No-ops when Resend isn't able to deliver to
 * arbitrary inboxes so forgot-password degrades instead of throwing.
 */
export const sendResetPasswordEmail = async ({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) => {
  if (!canDeliverTransactionalEmail()) {
    console.warn(
      "[resend] skipping reset email — configure a verified-domain FROM_EMAIL",
      { to, sandbox: isResendSandbox() },
    );
    return;
  }

  const resend = createResend();
  const html = await render(
    ResetPasswordEmail({
      resetUrl,
      userEmail: to,
    }),
  );

  const from = process.env.FROM_EMAIL ?? "";
  if (!from) {
    console.warn("[resend] skipping reset email — FROM_EMAIL unset", { to });
    return;
  }

  const result = await resend.emails.send({
    from,
    to,
    subject: "Reset your chillpen password",
    html,
  });

  if (result.error) {
    console.error("[resend] reset email failed", {
      to,
      from,
      error: result.error,
    });
    throw result.error;
  }
};
