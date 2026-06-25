export const AUTH_ERROR_PARAM = "error";

export function getAuthErrorMessage(error?: string) {
  switch (error) {
    case "missing-fields":
      return "Please fill in all fields.";
    case "signup-failed":
      return "We could not create your account. Please try again.";
    case "setup-failed":
      return "Your account was created, but workspace setup failed. Please try again.";
    case "login-failed":
      return "Invalid email or password.";
    case "workspace-not-found":
      return "We could not find an active workspace for this account.";
    default:
      return null;
  }
}

