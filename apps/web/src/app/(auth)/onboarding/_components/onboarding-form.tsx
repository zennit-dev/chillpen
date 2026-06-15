"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { field, InferredForm } from "@zenncore/web/components/inferred-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import * as User from "@/server/app/user";

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
};

export const OnboardingForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [submit, isPending] = useAsyncAction(
    async (data: { pseudonym: string }) => {
      setError(null);
      const result = await User.setPseudonym(data.pseudonym);
      if (!result.success) {
        setError("That pseudonym is taken — try another.");
        return;
      }
      router.push("/");
    },
  );

  return (
    <InferredForm config={config} onSubmit={submit}>
      {error ? (
        <p className="font-subtitle text-error text-sm">{error}</p>
      ) : null}
      <Button
        type="submit"
        color="primary"
        disabled={isPending}
        className="w-full"
      >
        Claim your handle
      </Button>
    </InferredForm>
  );
};
