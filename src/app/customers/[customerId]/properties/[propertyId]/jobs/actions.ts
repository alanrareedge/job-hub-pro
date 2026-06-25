"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type JobPriority = Database["public"]["Tables"]["jobs"]["Row"]["priority"];
type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

const priorities = ["low", "normal", "urgent"] as const;

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getPriority(value: string): JobPriority {
  return priorities.includes(value as JobPriority) ? (value as JobPriority) : "normal";
}

export async function createJob(
  customerId: string,
  propertyId: string,
  formData: FormData,
) {
  const title = getString(formData, "title");
  const reference = getString(formData, "reference");
  const description = getString(formData, "description");
  const priority = getPriority(getString(formData, "priority"));
  const targetDate = getString(formData, "targetDate");

  if (!title) {
    redirect(`/customers/${customerId}/properties/${propertyId}/jobs/new?error=missing-fields`);
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
    redirect(`/customers/${customerId}/properties/${propertyId}/jobs?error=owner-required`);
  }

  const { data: propertyData } = await supabase
    .from("properties")
    .select("id, customer_id")
    .eq("id", propertyId)
    .eq("customer_id", customerId)
    .eq("business_id", appUser.business_id)
    .is("archived_at", null)
    .single();
  const property = propertyData as { id: string; customer_id: string } | null;

  if (!property) {
    redirect(`/customers/${customerId}/properties?error=property-not-found`);
  }

  const jobInsert: JobInsert = {
    business_id: appUser.business_id,
    customer_id: property.customer_id,
    property_id: property.id,
    created_by_user_id: appUser.id,
    title,
    reference: reference || null,
    description: description || null,
    priority,
    target_date: targetDate || null,
  };

  const { data: jobData, error } = await supabase
    .from("jobs")
    .insert([jobInsert] as never[])
    .select("id")
    .single();
  const job = jobData as { id: string } | null;

  if (error || !job) {
    redirect(`/customers/${customerId}/properties/${propertyId}/jobs/new?error=create-failed`);
  }

  const auditLogInsert: AuditLogInsert = {
    business_id: appUser.business_id,
    user_id: appUser.id,
    entity_type: "job",
    entity_id: job.id,
    action: "job.created",
    details: {
      customer_id: property.customer_id,
      property_id: property.id,
      title,
      reference: reference || null,
      priority,
      status: "new",
      target_date: targetDate || null,
    },
  };

  await supabase.from("audit_logs").insert([auditLogInsert] as never[]);

  redirect(`/customers/${customerId}/properties/${propertyId}/jobs`);
}
