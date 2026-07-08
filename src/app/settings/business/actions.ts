"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type BusinessUpdate = Database["public"]["Tables"]["businesses"]["Update"];
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateBusinessDetails(formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const phone = getString(formData, "phone");
  const addressLine1 = getString(formData, "addressLine1");
  const addressLine2 = getString(formData, "addressLine2");
  const town = getString(formData, "town");
  const postcode = getString(formData, "postcode");

  if (!name) {
    redirect("/settings/business?error=missing-fields");
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: appUserData } = await supabase
    .from("users")
    .select("id, business_id, role")
    .eq("auth_user_id", authUser.id)
    .eq("status", "active")
    .is("archived_at", null)
    .single();
  const appUser = appUserData as CurrentAppUser | null;

  if (!appUser) {
    await supabase.auth.signOut();
    redirect("/login?error=workspace-not-found");
  }

  if (appUser.role !== "owner") {
    redirect("/settings/business?error=owner-required");
  }

  const businessUpdate: BusinessUpdate = {
    name,
    email: email || null,
    phone: phone || null,
    address_line_1: addressLine1 || null,
    address_line_2: addressLine2 || null,
    town: town || null,
    postcode: postcode || null,
  };

  const { error } = await supabase
    .from("businesses")
    .update(businessUpdate as never)
    .eq("id", appUser.business_id)
    .is("archived_at", null);

  if (error) {
    redirect("/settings/business?error=update-failed");
  }

  const auditLogInsert: AuditLogInsert = {
    business_id: appUser.business_id,
    user_id: appUser.id,
    entity_type: "business",
    entity_id: appUser.business_id,
    action: "business.updated",
    details: {
      business_id: appUser.business_id,
      name,
      email: email || null,
      phone: phone || null,
      address_line_1: addressLine1 || null,
      address_line_2: addressLine2 || null,
      town: town || null,
      postcode: postcode || null,
    },
  };

  await supabase.from("audit_logs").insert([auditLogInsert] as never[]);

  redirect("/settings/business?updated=true");
}
