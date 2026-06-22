import { SignUpForm } from "./_components/sign-up-form";

export const metadata = { title: "Claim a pseudonym" };

export default () => (
  <div>
    <header className="mb-7">
      <p className="font-medium font-subtitle text-2xs text-primary uppercase tracking-[0.2em]">
        30-day free trial
      </p>
      <h1 className="mt-2 font-display font-semibold text-3xl text-foreground">
        Claim a pseudonym
      </h1>
      <p className="mt-1 font-body text-foreground-dimmed text-sm">
        Your identity belongs to the worlds you build.
      </p>
    </header>
    <SignUpForm />
  </div>
);
