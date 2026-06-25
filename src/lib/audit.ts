export type AuditAction =
  | "business.created"
  | "customer.created"
  | "user.created"
  | "user.signup"
  | "user.login"
  | "user.role_changed"
  | "user.disabled"
  | "settings.updated";
