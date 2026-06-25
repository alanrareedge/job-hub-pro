"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function createProperty(customerId: string, formData: FormData) {
  const propertyName = getString(formData, "propertyName");
  const addressLine1 = getString(formData, "addressLine1");
  const addressLine2 = getString(formData, "addressLine2");
  const town = getString(formData, "town");
  const county = getString(formData, "county");
  const postcode = getString(formData, "postcode");
  const accessNotes = getString(formData, "accessNotes");
  const notes = getString(formData, "notes");

  if (!addressLine1 || !postcode) {
    redirect(`/customers/${customerId}/properties/new?error=missing-fields`);
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
    redirect(`/customers/${customerId}/properties?error=owner-required`);
  }

  const { data: customerData } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("business_id", appUser.business_id)
    .is("archived_at", null)
    .single();
  const customer = customerData as { id: string } | null;

  if (!customer) {
    redirect("/customers?error=customer-not-found");
  }

  const propertyInsert: PropertyInsert = {
    business_id: appUser.business_id,
    customer_id: customer.id,
    created_by_user_id: appUser.id,
    property_name: propertyName || null,
    address_line_1: addressLine1,
    address_line_2: addressLine2 || null,
    town: town || null,
    county: county || null,
    postcode,
    access_notes: accessNotes || null,
    notes: notes || null,
  };

  const { data: propertyData, error } = await supabase
    .from("properties")
    .insert([propertyInsert] as never[])
    .select("id")
    .single();
  const property = propertyData as { id: string } | null;

  if (error || !property) {
    redirect(`/customers/${customerId}/properties/new?error=create-failed`);
  }

  const auditLogInsert: AuditLogInsert = {
    business_id: appUser.business_id,
    user_id: appUser.id,
    entity_type: "property",
    entity_id: property.id,
    action: "property.created",
    details: {
      customer_id: customer.id,
      property_name: propertyName || null,
      address_line_1: addressLine1,
      postcode,
    },
  };

  await supabase.from("audit_logs").insert([auditLogInsert] as never[]);

  redirect(`/customers/${customerId}/properties`);
}
