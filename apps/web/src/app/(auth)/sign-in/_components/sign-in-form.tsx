"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { field, InferredForm } from "@zenncore/web/components/inferred-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { type AuthFeedback, signInFeedback } from "@/lib/auth-messages";
import * as Authentication from "@/server/app/authentication";
import { AuthAlert } from "../../_components/auth-alert";

const config = {
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

export const SignInForm = ({ justReset }: SignInForm.Props) => {
  const router = useRouter();
  const [feedback, setFeedback] = useState<AuthFeedback | null>(null);

  const [submit, isPending] = useAsyncAction(
    async (data: { email: string; password: string }) => {
      setFeedback(null);

      try {
        const result = await Authentication.signIn({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        });

        if (!result.success) {
          setFeedback(signInFeedback(result.error));
          return;
        }

        router.push("/discover");
        router.refresh();
      } catch {
        setFeedback({
          message:
            "Something went wrong while signing in. Try again in a moment.",
          hint: "reset-password",
        });
      }
    },
  );

  return (
    <InferredForm config={config} onSubmit={submit}>
      {justReset ? (
        <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 font-subtitle text-success text-sm">
          Password updated — sign in with your new password.
        </p>
      ) : null}
      <AuthAlert feedback={feedback} />
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="font-subtitle text-foreground-dimmed text-sm transition hover:text-primary"
        >
          Forgot password?
        </Link>
      </div>
      <Button
        type="submit"
        color="primary"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center font-subtitle text-foreground-dimmed text-sm">
        New here?{" "}
        <Link href="/sign-up" className="text-primary hover:text-primary-rich">
          Create an account
        </Link>
      </p>
    </InferredForm>
  );
};

export namespace SignInForm {
  export type Props = {
    justReset?: boolean;
  };
}
