import { OnboardingForm } from "./_components/onboarding-form";

export const metadata = { title: "Pick your pseudonym" };

export default () => (
  <div>
    <header className="mb-6 text-center">
      <h1 className="font-display font-semibold text-2xl text-foreground">
        Choose your handle
      </h1>
      <p className="mt-1 font-body text-foreground-dimmed text-sm">
        This is the name readers will follow. You can perform under a pseudonym
        — make it yours.
      </p>
    </header>
    <OnboardingForm />
  </div>
);
