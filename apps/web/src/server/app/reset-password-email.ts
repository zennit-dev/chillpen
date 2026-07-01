import { render } from "@react-email/render";
import { Resend } from "resend";
import { ResetPasswordEmail } from "@/public/templates/reset";

// Constructed lazily — `new Resend(undefined)` throws, which would crash any
// module that imports this at build time when no key is configured.
const createResend = () => new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the password-reset email. No-ops when Resend isn't configured so the
 * forgot-password flow degrades gracefully instead of throwing.
 */
export const sendResetPasswordEmail = async ({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) => {
  const canSend = (process.env.RESEND_API_KEY ?? "").length > 20;
  if (!canSend) return;

  const resend = createResend();
  const html = await render(
    ResetPasswordEmail({
      resetUrl,
      userEmail: to,
    }),
  );

  const result = await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    subject: "Reset your chillpen password",
    html,
  });

  if (result.error) throw result.error;
};
