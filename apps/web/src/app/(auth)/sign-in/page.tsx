import { parseSearchParam } from "@/utils/search-params";
import { SignInForm } from "./_components/sign-in-form";

export const metadata = { title: "Sign in" };

export default async ({ searchParams }: PageProps<"/sign-in">) => {
  const { reset } = await searchParams;
  const justReset = parseSearchParam(reset, "single") === "success";

  return (
    <div>
      <header className="mb-6 text-center">
        <h1 className="font-display font-semibold text-2xl text-foreground">
          Welcome back
        </h1>
        <p className="mt-1 font-body text-foreground-dimmed text-sm">
          Continue building worlds.
        </p>
      </header>
      <SignInForm justReset={justReset} />
    </div>
  );
};
