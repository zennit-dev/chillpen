import { SignUpForm } from "./_components/sign-up-form";

export const metadata = { title: "Create account" };

export default () => (
  <div>
    <header className="mb-6 text-center">
      <h1 className="font-display font-semibold text-2xl text-foreground">
        Join chillpen
      </h1>
      <p className="mt-1 font-body text-foreground-dimmed text-sm">
        Free to write. 30-day trial to read everything.
      </p>
    </header>
    <SignUpForm />
  </div>
);
