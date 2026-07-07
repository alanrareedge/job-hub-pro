"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type OpportunityStatus = Database["public"]["Tables"]["opportunities"]["Row"]["status"];
type OpportunityInsert = Database["public"]["Tables"]["opportunities"]["Insert"];
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

const createStatuses = ["new", "site_visit_required", "pricing", "proposal_sent"] as const;

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getStatus(value: string): OpportunityStatus {
  return createStatuses.includes(value as (typeof createStatuses)[number])
    ? (value as OpportunityStatus)
    : "new";
}

function getEstimatedValue(value: string) {
  if (!value) {
    return null;
  }

  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export async function createOpportunity(
  customerId: string,
  propertyId: string,
  formData: FormData,
) {
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const status = getStatus(getString(formData, "status"));
  const estimatedValue = getEstimatedValue(getString(formData, "estimatedValue"));
  const targetDate = getString(formData, "targetDate");

  if (!title) {
    redirect(
      `/customers/${customerId}/properties/${propertyId}/opportunities/new?error=missing-fields`,
    );
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
    redirect(
      `/customers/${customerId}/properties/${propertyId}/opportunities?error=owner-required`,
    );
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

  const opportunityInsert: OpportunityInsert = {
    business_id: appUser.business_id,
    customer_id: property.customer_id,
    property_id: property.id,
    created_by_user_id: appUser.id,
    title,
    description: description || null,
    status,
    estimated_value: estimatedValue,
    target_date: targetDate || null,
  };

  const { data: opportunityData, error } = await supabase
    .from("opportunities")
    .insert([opportunityInsert] as never[])
    .select("id")
    .single();
  const opportunity = opportunityData as { id: string } | null;

  if (error || !opportunity) {
    redirect(
      `/customers/${customerId}/properties/${propertyId}/opportunities/new?error=create-failed`,
    );
  }

  const auditLogInsert: AuditLogInsert = {
    business_id: appUser.business_id,
    user_id: appUser.id,
    entity_type: "opportunity",
    entity_id: opportunity.id,
    action: "opportunity.created",
    details: {
      customer_id: property.customer_id,
      property_id: property.id,
      title,
      status,
      estimated_value: estimatedValue,
      target_date: targetDate || null,
    },
  };

  await supabase.from("audit_logs").insert([auditLogInsert] as never[]);

  redirect(`/customers/${customerId}/properties/${propertyId}/opportunities`);
}
