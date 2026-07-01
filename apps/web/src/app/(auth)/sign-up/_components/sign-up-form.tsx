"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { field, InferredForm } from "@zenncore/web/components/inferred-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { CheckBadgeIcon } from "@/components/icons";
import * as Authentication from "@/server/app/authentication";

const config = {
  pseudonym: field({
    shape: "text",
    validator: z
      .string()
      .min(3)
      .max(20)
      .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
    label: "Pseudonym",
    placeholder: "LunaInk",
  }),
  email: field({
    shape: "text",
    type: "email",
    validator: z.string().email(),
    label: "Email",
    placeholder: "you@example.com",
  }),
  password: field({
    shape: "text",
    type: "password",
    validator: z.string().min(8),
    label: "Password",
  }),
};

export const SignUpForm = () => {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // When the email already exists we show sign-in / reset shortcuts alongside
  // the message so the user isn't stuck.
  const [emailTaken, setEmailTaken] = useState(false);

  const [submit, isPending] = useAsyncAction(
    async (data: { pseudonym: string; email: string; password: string }) => {
      setError(null);
      setEmailTaken(false);

      // Catch the most common failure early with a clear, specific message.
      const existing = await Authentication.doesEmailExist({
        email: data.email,
      });
      if (existing.success && existing.data) {
        setEmailTaken(true);
        setError("That email already has a chillpen account.");
        return;
      }

      const result = await Authentication.signUp(data);
      if (!result.success) {
        const message = result.error?.message ?? "";
        if (/email/i.test(message)) {
          setEmailTaken(true);
          setError("That email already has a chillpen account.");
          return;
        }
        setError(
          /pseudonym/i.test(message)
            ? "That pseudonym is already taken — try another."
            : "Could not create your account. Try a different pseudonym or email.",
        );
        return;
      }
      // Verified inline (no email gate) → continue to the payment step.
      if (result.data.verified) {
        router.push("/sign-up/payment");
        return;
      }
      setSent(true);
    },
  );

  if (sent)
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <CheckBadgeIcon className="mx-auto size-10 text-primary" />
        <h2 className="mt-3 font-display font-medium text-foreground text-lg">
          Check your email
        </h2>
        <p className="mt-1 font-body text-foreground-dimmed text-sm">
          Verify your address, then{" "}
          <Link href="/sign-in" className="text-primary">
            sign in
          </Link>{" "}
          to add payment and start your trial.
        </p>
      </div>
    );

  return (
    <InferredForm config={config} onSubmit={submit}>
      {error ? (
        <div className="rounded-md border border-error/30 bg-error/10 px-3 py-2 font-subtitle text-error text-sm">
          <p>{error}</p>
          {emailTaken ? (
            <p className="mt-1 text-foreground-dimmed">
              <Link
                href="/sign-in"
                className="text-primary hover:text-primary-rich"
              >
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
          ) : null}
        </div>
      ) : null}
      <Button
        type="submit"
        color="primary"
        disabled={isPending}
        className="w-full"
      >
        Create account
      </Button>
      <p className="text-center font-subtitle text-foreground-dimmed text-sm">
        Have an account?{" "}
        <Link href="/sign-in" className="text-primary hover:text-primary-rich">
          Sign in
        </Link>
      </p>
    </InferredForm>
  );
};
