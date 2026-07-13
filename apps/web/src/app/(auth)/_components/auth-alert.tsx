"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { AuthFeedback } from "@/lib/auth-messages";

export const AuthAlert = ({
  feedback,
}: {
  feedback: AuthFeedback | null;
}) => {
  if (!feedback) return null;

  return (
    <div className="rounded-md border border-error/30 bg-error/10 px-3 py-2 font-subtitle text-error text-sm">
      <p>{feedback.message}</p>
      {feedback.hint ? <Hint hint={feedback.hint} /> : null}
    </div>
  );
};

const Hint = ({ hint }: { hint: NonNullable<AuthFeedback["hint"]> }) => {
  const links: Record<NonNullable<AuthFeedback["hint"]>, ReactNode> = {
    "sign-in": (
      <p className="mt-1 text-foreground-dimmed">
        <Link href="/sign-in" className="text-primary hover:text-primary-rich">
          Sign in
        </Link>{" "}
        or{" "}
        <Link
          href="/forgot-password"
          className="text-primary hover:text-primary-rich"
        >
          reset your password
        </Link>
        .
      </p>
    ),
    "sign-up": (
      <p className="mt-1 text-foreground-dimmed">
        <Link href="/sign-up" className="text-primary hover:text-primary-rich">
          Create an account
        </Link>{" "}
        or try another email.
      </p>
    ),
    "reset-password": (
      <p className="mt-1 text-foreground-dimmed">
        <Link
          href="/forgot-password"
          className="text-primary hover:text-primary-rich"
        >
          Reset your password
        </Link>{" "}
        if you forgot it.
      </p>
    ),
    "verify-email": (
      <p className="mt-1 text-foreground-dimmed">
        Didn&apos;t get it? Check spam, or{" "}
        <Link href="/sign-in" className="text-primary hover:text-primary-rich">
          try signing in again
        </Link>{" "}
        to resend.
      </p>
    ),
  };

  return links[hint];
};
