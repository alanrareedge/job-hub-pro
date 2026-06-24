import type { UserRole } from "@/types/roles";

export function isOwner(role: UserRole) {
  return role === "owner";
}

