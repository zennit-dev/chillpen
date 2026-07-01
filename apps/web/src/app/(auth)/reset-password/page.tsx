import Link from "next/link";
import { parseSearchParam } from "@/utils/search-params";
import { ResetPasswordForm } from "./_components/reset-password-form";

export const metadata = { title: "Choose a new password" };

export default async ({ searchParams }: PageProps<"/reset-password">) => {
  const { token: parameter } = await searchParams;
  const token = parseSearchParam(parameter, "single");

  if (!token)
    return (
      <div className="text-center">
        <h1 className="font-display font-semibold text-2xl text-foreground">
          Link expired
        </h1>
        <p className="mt-2 font-body text-foreground-dimmed text-sm">
          This reset link is missing or has expired. Request a fresh one and
          we’ll email it right over.
        </p>
        <Link
          href="/forgot-password"
          className="mt-5 inline-block font-subtitle text-primary text-sm hover:text-primary-rich"
        >
          Send a new reset link
        </Link>
      </div>
    );

  return (
    <div>
      <header className="mb-6 text-center">
        <h1 className="font-display font-semibold text-2xl text-foreground">
          Choose a new password
        </h1>
        <p className="mt-1 font-body text-foreground-dimmed text-sm">
          Pick something you’ll remember — at least 8 characters.
        </p>
      </header>
      <ResetPasswordForm token={token} />
    </div>
  );
};
