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
  password: field({
    shape: "text",
    type: "password",
    validator: z.string().min(8, "At least 8 characters"),
    label: "New password",
  }),
  confirm: field({
    shape: "text",
    type: "password",
    validator: z.string().min(8),
    label: "Confirm password",
  }),
};

export const ResetPasswordForm = ({ token }: ResetPasswordForm.Props) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [submit, isPending] = useAsyncAction(
    async (data: { password: string; confirm: string }) => {
      setError(null);
      if (data.password !== data.confirm) {
        setError("Those passwords don’t match.");
        return;
      }
      const result = await Authentication.resetPassword({
        token,
        password: data.password,
      });
      if (!result.success) {
        setError(
          "We couldn’t reset your password. The link may have expired — request a new one.",
        );
        return;
      }
      router.push("/sign-in?reset=success");
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
        Reset password
      </Button>
      <p className="text-center font-subtitle text-foreground-dimmed text-sm">
        Need a fresh link?{" "}
        <Link
          href="/forgot-password"
          className="text-primary hover:text-primary-rich"
        >
          Request one
        </Link>
      </p>
    </InferredForm>
  );
};

export namespace ResetPasswordForm {
  export type Props = {
    token: string;
  };
}
