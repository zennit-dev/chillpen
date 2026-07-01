import { ForgotPasswordForm } from "./_components/forgot-password-form";

export const metadata = { title: "Reset your password" };

export default () => (
  <div>
    <header className="mb-6 text-center">
      <h1 className="font-display font-semibold text-2xl text-foreground">
        Forgot your password?
      </h1>
      <p className="mt-1 font-body text-foreground-dimmed text-sm">
        Enter your email and we’ll send you a reset link.
      </p>
    </header>
    <ForgotPasswordForm />
  </div>
);
