"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { field, InferredForm } from "@zenncore/web/components/inferred-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import * as Authentication from "@/server/app/authentication";

const config = {
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

export const SignInForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [submit, isPending] = useAsyncAction(
    async (data: { email: string; password: string }) => {
      setError(null);
      const result = await Authentication.signIn(data);
      if (!result.success) {
        setError("That email and password don't match.");
        return;
      }
      router.push("/discover");
    },
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
        Sign in
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
