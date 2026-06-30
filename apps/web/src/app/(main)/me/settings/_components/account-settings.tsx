"use client";

import { cn } from "@zenncore/utils";
import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { TextField, TextFieldInput } from "@zenncore/web/components/text-field";
import { type ReactNode, useState } from "react";
import { AvatarPicker } from "@/components/avatar-picker";
import * as Authentication from "@/server/app/authentication";
import * as Subscription from "@/server/app/subscription";
import * as User from "@/server/app/user";

type Feedback = { tone: "ok" | "error"; message: string } | null;

export const AccountSettings = ({
  pseudonym: initialPseudonym,
  email: initialEmail,
  avatar,
  subscriptionStatus,
}: AccountSettings.Props) => {
  const [pseudonym, setPseudonym] = useState(initialPseudonym);
  const [pseudonymNote, setPseudonymNote] = useState<Feedback>(null);
  const [savePseudonym, savingPseudonym] = useAsyncAction(async () => {
    setPseudonymNote(null);
    const result = await User.setPseudonym(pseudonym);
    setPseudonymNote(
      result.success
        ? { tone: "ok", message: "Pseudonym updated." }
        : { tone: "error", message: "That pseudonym is taken — try another." },
    );
  });

  const [email, setEmail] = useState(initialEmail);
  const [emailNote, setEmailNote] = useState<Feedback>(null);
  const [saveEmail, savingEmail] = useAsyncAction(async () => {
    setEmailNote(null);
    const result = await User.updateProfile({ email });
    setEmailNote(
      result.success
        ? { tone: "ok", message: "Email updated." }
        : { tone: "error", message: "Could not update your email." },
    );
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordNote, setPasswordNote] = useState<Feedback>(null);
  const [savePassword, savingPassword] = useAsyncAction(async () => {
    setPasswordNote(null);
    if (newPassword.length < 8) {
      setPasswordNote({
        tone: "error",
        message: "New password must be at least 8 characters.",
      });
      return;
    }
    const result = await Authentication.changePassword({
      currentPassword,
      newPassword,
    });
    if (result.success) {
      setCurrentPassword("");
      setNewPassword("");
      setPasswordNote({ tone: "ok", message: "Password changed." });
      return;
    }
    setPasswordNote({
      tone: "error",
      message: "Current password is incorrect.",
    });
  });

  const [billingNote, setBillingNote] = useState<Feedback>(null);
  const [openBilling, openingBilling] = useAsyncAction(async () => {
    setBillingNote(null);
    const result = await Subscription.billingPortal();
    if (result.success) {
      window.location.href = result.data.url;
      return;
    }
    setBillingNote({
      tone: "error",
      message:
        "No billing account yet. Start a subscription to manage payment details.",
    });
  });

  return (
    <div className="space-y-6">
      <Section
        title="Avatar"
        description="Pick the face other writers see across chillpen."
      >
        <AvatarPicker initial={avatar} name={pseudonym} />
      </Section>

      <Section title="Pseudonym" description="Your identity across chillpen.">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Pseudonym" className="min-w-[200px] flex-1">
            <TextField value={pseudonym} onValueChange={setPseudonym}>
              <TextFieldInput placeholder="LunaInk" />
            </TextField>
          </Field>
          <Button
            color="primary"
            disabled={savingPseudonym}
            onClick={() => void savePseudonym()}
          >
            Save
          </Button>
        </div>
        <Status note={pseudonymNote} />
      </Section>

      <Section title="Email" description="Used for sign-in and receipts.">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Email" className="min-w-[200px] flex-1">
            <TextField value={email} onValueChange={setEmail}>
              <TextFieldInput type="email" placeholder="you@example.com" />
            </TextField>
          </Field>
          <Button
            color="primary"
            disabled={savingEmail}
            onClick={() => void saveEmail()}
          >
            Save
          </Button>
        </div>
        <Status note={emailNote} />
      </Section>

      <Section title="Password" description="Change your password.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Current password">
            <TextField
              value={currentPassword}
              onValueChange={setCurrentPassword}
            >
              <TextFieldInput type="password" placeholder="••••••••" />
            </TextField>
          </Field>
          <Field label="New password">
            <TextField value={newPassword} onValueChange={setNewPassword}>
              <TextFieldInput type="password" placeholder="••••••••" />
            </TextField>
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            color="primary"
            disabled={savingPassword}
            onClick={() => void savePassword()}
          >
            Update password
          </Button>
          <Status note={passwordNote} inline />
        </div>
      </Section>

      <Section
        title="Subscription & payment"
        description="Manage your card, invoices, and plan."
      >
        <p className="mb-3 font-subtitle text-foreground-dimmed text-sm">
          Status:{" "}
          <span className="font-medium text-foreground capitalize">
            {subscriptionStatus}
          </span>
        </p>
        <Button
          variant="outline"
          color="neutral"
          disabled={openingBilling}
          onClick={() => void openBilling()}
        >
          Manage payment
        </Button>
        <Status note={billingNote} />
      </Section>
    </div>
  );
};

export namespace AccountSettings {
  export type Props = {
    pseudonym: string;
    email: string;
    avatar: string | null;
    subscriptionStatus: string;
  };
}

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) => (
  <section className="rounded-2xl border border-white/8 bg-background-rich p-5 sm:p-6">
    <h2 className="font-display font-medium text-foreground text-lg">
      {title}
    </h2>
    <p className="mt-0.5 mb-4 font-body text-foreground-dimmed text-sm">
      {description}
    </p>
    {children}
  </section>
);

const Field = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) => (
  <div className={cn("block", className)}>
    <span className="mb-1.5 block font-medium font-subtitle text-2xs text-foreground-dimmed uppercase tracking-widest">
      {label}
    </span>
    {children}
  </div>
);

const Status = ({ note, inline }: { note: Feedback; inline?: boolean }) => {
  if (!note) return null;
  return (
    <p
      className={cn(
        "font-subtitle text-sm",
        inline ? "" : "mt-2",
        note.tone === "ok" ? "text-success" : "text-error",
      )}
    >
      {note.message}
    </p>
  );
};
