"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type PricingInsert = Database["public"]["Tables"]["opportunity_pricing"]["Insert"];
type PricingUpdate = Database["public"]["Tables"]["opportunity_pricing"]["Update"];
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];
type LabourRateType =
  Database["public"]["Tables"]["opportunity_pricing"]["Row"]["labour_rate_type"];

const labourRateTypes = ["hourly", "daily", "fixed"] as const;

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getNonNegativeNumber(formData: FormData, field: string) {
  const value = Number(getString(formData, field));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function getLabourRateType(value: string): LabourRateType {
  return labourRateTypes.includes(value as LabourRateType)
    ? (value as LabourRateType)
    : "hourly";
}

function getPercent(formData: FormData, field: string, fallback: number) {
  const rawValue = getString(formData, field);
  const value = rawValue ? Number(rawValue) : fallback;

  if (!Number.isFinite(value) || value < 0) {
    return fallback;
  }

  return Math.min(value, 99);
}

function calculateRecommendedSellingPrice(pricing: {
  labour_rate_type: LabourRateType;
  labour_people_count: number;
  labour_units: number;
  labour_rate: number;
  labour_fixed_cost: number;
  materials_cost: number;
  plant_cost: number;
  waste_cost: number;
  subcontractor_cost: number;
  other_cost: number;
  risk_allowance_percent: number;
  target_margin_percent: number;
}) {
  const labourCost =
    pricing.labour_rate_type === "fixed"
      ? pricing.labour_fixed_cost
      : pricing.labour_people_count * pricing.labour_units * pricing.labour_rate;
  const baseCost =
    labourCost +
    pricing.materials_cost +
    pricing.plant_cost +
    pricing.waste_cost +
    pricing.subcontractor_cost +
    pricing.other_cost;
  const riskAllowance = baseCost * (pricing.risk_allowance_percent / 100);
  const costBeforeMargin = baseCost + riskAllowance;
  const marginMultiplier = 1 - pricing.target_margin_percent / 100;

  return marginMultiplier > 0 ? costBeforeMargin / marginMultiplier : costBeforeMargin;
}

export async function savePricing(
  customerId: string,
  propertyId: string,
  opportunityId: string,
  formData: FormData,
) {
  const labourRateType = getLabourRateType(getString(formData, "labourRateType"));
  const labourPeopleCount =
    labourRateType === "fixed" ? 0 : getNonNegativeNumber(formData, "labourPeopleCount");
  const labourUnits =
    labourRateType === "fixed" ? 0 : getNonNegativeNumber(formData, "labourUnits");
  const labourRate =
    labourRateType === "fixed" ? 0 : getNonNegativeNumber(formData, "labourRate");
  const labourFixedCost =
    labourRateType === "fixed" ? getNonNegativeNumber(formData, "labourFixedCost") : 0;

  const pricingValues = {
    work_type: getString(formData, "workType") || null,
    customer_outcome: getString(formData, "customerOutcome") || null,
    scope_notes: getString(formData, "scopeNotes") || null,
    labour_rate_type: labourRateType,
    labour_people_count: labourPeopleCount,
    labour_units: labourUnits,
    labour_rate: labourRate,
    labour_fixed_cost: labourFixedCost,
    labour_hours: labourRateType === "fixed" ? 0 : labourPeopleCount * labourUnits,
    materials_cost: getNonNegativeNumber(formData, "materialsCost"),
    plant_cost: getNonNegativeNumber(formData, "plantCost"),
    waste_cost: getNonNegativeNumber(formData, "wasteCost"),
    subcontractor_cost: getNonNegativeNumber(formData, "subcontractorCost"),
    other_cost: getNonNegativeNumber(formData, "otherCost"),
    risk_allowance_percent: getPercent(formData, "riskAllowancePercent", 0),
    target_margin_percent: getPercent(formData, "targetMarginPercent", 30),
    assumptions: getString(formData, "assumptions") || null,
    exclusions: getString(formData, "exclusions") || null,
    proposal_notes: getString(formData, "proposalNotes") || null,
  };

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
      `/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}/pricing?error=owner-required`,
    );
  }

  const { data: opportunityData } = await supabase
    .from("opportunities")
    .select("id, customer_id, property_id")
    .eq("id", opportunityId)
    .eq("customer_id", customerId)
    .eq("property_id", propertyId)
    .eq("business_id", appUser.business_id)
    .is("archived_at", null)
    .single();
  const opportunity = opportunityData as {
    id: string;
    customer_id: string;
    property_id: string;
  } | null;

  if (!opportunity) {
    redirect(`/customers/${customerId}/properties/${propertyId}/opportunities`);
  }

  const { data: existingPricingData } = await supabase
    .from("opportunity_pricing")
    .select("id")
    .eq("opportunity_id", opportunity.id)
    .eq("business_id", appUser.business_id)
    .is("archived_at", null)
    .maybeSingle();
  const existingPricing = existingPricingData as { id: string } | null;

  const recommendedSellingPrice = calculateRecommendedSellingPrice(pricingValues);
  const auditDetails = {
    opportunity_id: opportunity.id,
    property_id: opportunity.property_id,
    customer_id: opportunity.customer_id,
    work_type: pricingValues.work_type,
    labour_rate_type: pricingValues.labour_rate_type,
    labour_people_count: pricingValues.labour_people_count,
    labour_units: pricingValues.labour_units,
    labour_rate: pricingValues.labour_rate,
    labour_fixed_cost: pricingValues.labour_fixed_cost,
    materials_cost: pricingValues.materials_cost,
    risk_allowance_percent: pricingValues.risk_allowance_percent,
    target_margin_percent: pricingValues.target_margin_percent,
    recommended_selling_price: Number(recommendedSellingPrice.toFixed(2)),
  };

  if (existingPricing) {
    const pricingUpdate: PricingUpdate = {
      ...pricingValues,
      updated_by_user_id: appUser.id,
    };

    const { error } = await supabase
      .from("opportunity_pricing")
      .update(pricingUpdate as never)
      .eq("id", existingPricing.id)
      .eq("business_id", appUser.business_id);

    if (error) {
      redirect(
        `/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}/pricing?error=save-failed`,
      );
    }

    const auditLogInsert: AuditLogInsert = {
      business_id: appUser.business_id,
      user_id: appUser.id,
      entity_type: "pricing",
      entity_id: existingPricing.id,
      action: "pricing.updated",
      details: auditDetails,
    };

    await supabase.from("audit_logs").insert([auditLogInsert] as never[]);
  } else {
    const pricingInsert: PricingInsert = {
      business_id: appUser.business_id,
      customer_id: opportunity.customer_id,
      property_id: opportunity.property_id,
      opportunity_id: opportunity.id,
      created_by_user_id: appUser.id,
      updated_by_user_id: appUser.id,
      ...pricingValues,
    };

    const { data: pricingData, error } = await supabase
      .from("opportunity_pricing")
      .insert([pricingInsert] as never[])
      .select("id")
      .single();
    const pricing = pricingData as { id: string } | null;

    if (error || !pricing) {
      redirect(
        `/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}/pricing?error=save-failed`,
      );
    }

    const auditLogInsert: AuditLogInsert = {
      business_id: appUser.business_id,
      user_id: appUser.id,
      entity_type: "pricing",
      entity_id: pricing.id,
      action: "pricing.created",
      details: auditDetails,
    };

    await supabase.from("audit_logs").insert([auditLogInsert] as never[]);
  }

  redirect(`/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}/pricing`);
}
