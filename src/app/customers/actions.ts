"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function createCustomer(formData: FormData) {
  const firstName = getString(formData, "firstName");
  const lastName = getString(formData, "lastName");
  const email = getString(formData, "email");
  const phone = getString(formData, "phone");
  const notes = getString(formData, "notes");

  if (!firstName || !lastName) {
    redirect("/customers/new?error=missing-fields");
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
    redirect("/customers?error=owner-required");
  }

  const customerInsert: CustomerInsert = {
    business_id: appUser.business_id,
    created_by_user_id: appUser.id,
    first_name: firstName,
    last_name: lastName,
    email: email || null,
    phone: phone || null,
    notes: notes || null,
  };

  const { data: customerData, error } = await supabase
    .from("customers")
    .insert([customerInsert] as never[])
    .select("id")
    .single();
  const customer = customerData as { id: string } | null;

  if (error || !customer) {
    redirect("/customers/new?error=create-failed");
  }

  const auditLogInsert: AuditLogInsert = {
    business_id: appUser.business_id,
    user_id: appUser.id,
    entity_type: "customer",
    entity_id: customer.id,
    action: "customer.created",
    details: {
      first_name: firstName,
      last_name: lastName,
      email: email || null,
      phone: phone || null,
    },
  };

  await supabase.from("audit_logs").insert([auditLogInsert] as never[]);

  redirect("/customers");
}
