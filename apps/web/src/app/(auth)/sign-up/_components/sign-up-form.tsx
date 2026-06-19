"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { field, InferredForm } from "@zenncore/web/components/inferred-form";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { CheckBadgeIcon } from "@/components/icons";
import * as Authentication from "@/server/app/authentication";

const config = {
  fullName: field({
    shape: "text",
    validator: z.string().min(2),
    label: "Full name",
    placeholder: "Ada Lovelace",
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
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [submit, isPending] = useAsyncAction(
    async (data: { fullName: string; email: string; password: string }) => {
      setError(null);
      const result = await Authentication.signUp(data);
      if (!result.success) {
        setError("Could not create your account. Try another email.");
        return;
      }
      setSent(true);
    },
  );

  if (sent)
    return (
      <div className="glass rounded-xl p-6 text-center">
        <CheckBadgeIcon className="mx-auto size-10 text-primary" />
        <h2 className="mt-3 font-display font-medium text-foreground text-lg">
          Check your email
        </h2>
        <p className="mt-1 font-body text-foreground-dimmed text-sm">
          Verify your address to start writing and earning. Then{" "}
          <Link href="/sign-in" className="text-primary">
            sign in
          </Link>
          .
        </p>
      </div>
    );

  return (
    <InferredForm config={config} onSubmit={submit}>
      {error ? (
        <p className="rounded-md border border-error/30 bg-error/10 px-3 py-2 font-subtitle text-error text-sm">
          {error}
        </p>
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
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary hover:text-primary-rich">
          Sign in
        </Link>
      </p>
    </InferredForm>
  );
};
