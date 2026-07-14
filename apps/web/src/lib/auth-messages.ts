export type AuthFeedback = {
  message: string;
  hint?: "sign-up" | "sign-in" | "reset-password" | "verify-email";
};

export const signInFeedback = (
  error: { message?: string } | null | undefined,
): AuthFeedback => {
  const message = error?.message ?? "";

  if (message.includes("No account found"))
    return {
      message,
      hint: "sign-up",
    };

  if (message.includes("Incorrect password") || message.includes("no password"))
    return {
      message,
      hint: "reset-password",
    };

  if (message.includes("Verify your email"))
    return {
      message,
      hint: "verify-email",
    };

  if (
    message.includes("already has a chillpen account") ||
    message.includes("already exists")
  )
    return {
      message,
      hint: "sign-up",
    };

  if (message.includes("pseudonym")) return { message };

  return {
    message: message || "Could not sign in. Check your email and password.",
    hint: "reset-password",
  };
};

export const signUpFeedback = (
  error: { message?: string } | null | undefined,
): AuthFeedback => {
  const message = error?.message ?? "";

  if (/email/i.test(message) && /exist|taken|already/i.test(message))
    return {
      message: "That email already has a chillpen account.",
      hint: "sign-in",
    };

  if (/pseudonym/i.test(message))
    return { message: "That pseudonym is already taken — try another." };

  return {
    message:
      message ||
      "Could not create your account. Try a different email or pseudonym.",
  };
};
