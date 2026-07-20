/**
 * Resend delivery gates for chillpen.
 *
 * A key alone is not enough. Resend's shared test sender
 * (`onboarding@resend.dev`) can only deliver to the Resend account owner's
 * inbox. Treating that as "real email" would lock every other signup behind a
 * verification link that never arrives.
 *
 * `canDeliverTransactionalEmail` is true only when we have a key AND a
 * from-address on a domain you verified in Resend (not the sandbox sender).
 */

export const isResendSandbox = () =>
  (process.env.FROM_EMAIL ?? "onboarding@resend.dev").includes(
    "onboarding@resend.dev",
  );

export const canDeliverTransactionalEmail = () =>
  (process.env.RESEND_API_KEY ?? "").length > 20 && !isResendSandbox();
