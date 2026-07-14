"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { field, InferredForm } from "@zenncore/web/components/inferred-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { CheckBadgeIcon } from "@/components/icons";
import { type AuthFeedback, signUpFeedback } from "@/lib/auth-messages";
import * as Authentication from "@/server/app/authentication";
import { AuthAlert } from "../../_components/auth-alert";

const config = {
  pseudonym: field({
    shape: "text",
    validator: z
      .string()
      .min(3, "At least 3 characters.")
      .max(20, "At most 20 characters.")
      .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only."),
    label: "Pseudonym",
    placeholder: "LunaInk",
  }),
  email: field({
    shape: "text",
    type: "email",
    validator: z.string().email("Enter a valid email address."),
    label: "Email",
    placeholder: "you@example.com",
  }),
  password: field({
    shape: "text",
    type: "password",
    validator: z.string().min(8, "Password must be at least 8 characters."),
    label: "Password",
  }),
};

export const SignUpForm = () => {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [emailSandbox, setEmailSandbox] = useState(false);
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);

  const [submit, isPending] = useAsyncAction(
    async (data: { pseudonym: string; email: string; password: string }) => {
      setFeedback(null);

      try {
        const existing = await Authentication.doesEmailExist({
          email: data.email.trim().toLowerCase(),
        });
        if (existing.success && existing.data) {
          setFeedback({
            message: "That email already has a chillpen account.",
            hint: "sign-in",
          });
          return;
        }

        const result = await Authentication.signUp({
          pseudonym: data.pseudonym.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        });

        if (!result.success) {
          setFeedback(signUpFeedback(result.error));
          return;
        }

        if (result.data.verified) {
          router.push("/sign-up/payment");
          router.refresh();
          return;
        }

        setEmailSandbox(Boolean(result.data.emailSandbox));
        setSent(true);
      } catch {
        setFeedback({
          message:
            "Something went wrong while creating your account. Try again.",
        });
      }
    },
  );

  if (sent)
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <CheckBadgeIcon className="mx-auto size-10 text-primary" />
        <h2 className="mt-3 font-display font-medium text-foreground text-lg">
          {emailSandbox
            ? "Almost there — email setup is incomplete"
            : "Check your email"}
        </h2>
        {emailSandbox ? (
          <p className="mt-1 font-body text-foreground-dimmed text-sm">
            chillpen is still using Resend&apos;s test sender (
            <span className="text-foreground">onboarding@resend.dev</span>
            ), which can only deliver to the Resend account owner&apos;s inbox —
            not to Hotmail or other addresses. Verify a domain at{" "}
            <a
              href="https://resend.com/domains"
              target="_blank"
              rel="noreferrer"
              className="text-primary"
            >
              resend.com/domains
            </a>{" "}
            and set <span className="text-foreground">FROM_EMAIL</span> to an
            address on that domain, then ask an admin to verify your account or
            try again.
          </p>
        ) : (
          <p className="mt-1 font-body text-foreground-dimmed text-sm">
            We sent a verification link. After you verify,{" "}
            <Link href="/sign-in" className="text-primary">
              sign in
            </Link>{" "}
            to add payment and start your trial.
          </p>
        )}
        <p className="mt-4 font-body text-foreground-dimmed text-sm">
          Already verified?{" "}
          <Link href="/sign-in" className="text-primary">
            Sign in
          </Link>
        </p>
      </div>
    );

  return (
    <InferredForm config={config} onSubmit={submit}>
      <AuthAlert feedback={feedback} />
      <Button
        type="submit"
        color="primary"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Creating account…" : "Create account"}
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
