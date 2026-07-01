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
  email: field({
    shape: "text",
    type: "email",
    validator: z.string().email(),
    label: "Email",
    placeholder: "you@example.com",
  }),
};

export const ForgotPasswordForm = () => {
  const [sent, setSent] = useState(false);

  const [submit, isPending] = useAsyncAction(
    async (data: { email: string }) => {
      // Always report success — never reveal whether an email is registered.
      await Authentication.forgotPassword({ email: data.email });
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
          If that address has a chillpen account, a reset link is on its way.
        </p>
        <Link
          href="/sign-in"
          className="mt-4 inline-block font-subtitle text-primary text-sm hover:text-primary-rich"
        >
          Back to sign in
        </Link>
      </div>
    );

  return (
    <InferredForm config={config} onSubmit={submit}>
      <Button
        type="submit"
        color="primary"
        disabled={isPending}
        className="w-full"
      >
        Send reset link
      </Button>
      <p className="text-center font-subtitle text-foreground-dimmed text-sm">
        Remembered it?{" "}
        <Link href="/sign-in" className="text-primary hover:text-primary-rich">
          Sign in
        </Link>
      </p>
    </InferredForm>
  );
};
