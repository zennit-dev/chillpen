"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { field, InferredForm } from "@zenncore/web/components/inferred-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { AvatarPicker } from "@/components/avatar-picker";
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
  const [step, setStep] = useState<"pseudonym" | "avatar">("pseudonym");
  const [pseudonym, setPseudonym] = useState("");

  const [submit, isPending] = useAsyncAction(
    async (data: { pseudonym: string }) => {
      setError(null);
      const result = await User.setPseudonym(data.pseudonym);
      if (!result.success) {
        setError("That pseudonym is taken — try another.");
        return;
      }
      setPseudonym(data.pseudonym);
      setStep("avatar");
    },
  );

  if (step === "avatar")
    return (
      <div className="space-y-5">
        <div>
          <p className="font-display font-medium text-foreground text-lg">
            Pick your avatar
          </p>
          <p className="font-body text-foreground-dimmed text-sm">
            Choose a face for your writing. You can change it any time in
            settings.
          </p>
        </div>
        <AvatarPicker name={pseudonym} />
        <Button
          color="primary"
          onClick={() => router.push("/")}
          className="w-full"
        >
          Enter chillpen
        </Button>
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
        Claim your handle
      </Button>
    </InferredForm>
  );
};
