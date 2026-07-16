"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getProposalSectionConfig } from "@/lib/proposal-sections";
import type { Database } from "@/types/database";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type BusinessSnapshot = Pick<
  Database["public"]["Tables"]["businesses"]["Row"],
  | "id"
  | "name"
  | "trading_name"
  | "email"
  | "phone"
  | "address_line_1"
  | "address_line_2"
  | "town"
  | "county"
  | "postcode"
  | "country"
  | "company_registration_number"
  | "vat_registration_number"
  | "short_company_description"
  | "public_contact_email"
  | "public_contact_phone"
>;
type CustomerSnapshot = Pick<
  Database["public"]["Tables"]["customers"]["Row"],
  "id" | "first_name" | "last_name" | "email" | "phone"
>;
type PropertySnapshot = Pick<
  Database["public"]["Tables"]["properties"]["Row"],
  | "id"
  | "property_name"
  | "address_line_1"
  | "address_line_2"
  | "town"
  | "county"
  | "postcode"
>;
type OpportunitySnapshot = Pick<
  Database["public"]["Tables"]["opportunities"]["Row"],
  "id" | "title" | "description" | "status" | "estimated_value" | "target_date"
>;
type PricingSnapshot = Database["public"]["Tables"]["opportunity_pricing"]["Row"];
type ProposalInsert = Database["public"]["Tables"]["proposals"]["Insert"];
type ProposalUpdate = Database["public"]["Tables"]["proposals"]["Update"];
type ProposalOptionInsert = Database["public"]["Tables"]["proposal_options"]["Insert"];
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

function getNumber(value: number | null | undefined) {
  return value ?? 0;
}

function calculatePricing(pricing: PricingSnapshot) {
  const labourCost =
    pricing.labour_rate_type === "fixed"
      ? getNumber(pricing.labour_fixed_cost)
      : getNumber(pricing.labour_people_count) *
        getNumber(pricing.labour_units) *
        getNumber(pricing.labour_rate);
  const baseCost =
    labourCost +
    getNumber(pricing.materials_cost) +
    getNumber(pricing.plant_cost) +
    getNumber(pricing.waste_cost) +
    getNumber(pricing.subcontractor_cost) +
    getNumber(pricing.other_cost);
  const riskAllowance = baseCost * (getNumber(pricing.risk_allowance_percent) / 100);
  const costBeforeProfit = baseCost + riskAllowance;
  const marginMultiplier = 1 - getNumber(pricing.target_margin_percent) / 100;
  const recommendedSellingPrice =
    marginMultiplier > 0 ? costBeforeProfit / marginMultiplier : costBeforeProfit;
  const projectedProfit = recommendedSellingPrice - costBeforeProfit;

  return {
    costBeforeProfit: Number(costBeforeProfit.toFixed(2)),
    projectedProfit: Number(projectedProfit.toFixed(2)),
    recommendedSellingPrice: Number(recommendedSellingPrice.toFixed(2)),
  };
}

function getProposalTitle({
  customer,
  opportunity,
  property,
}: {
  customer: CustomerSnapshot;
  opportunity: OpportunitySnapshot;
  property: PropertySnapshot;
}) {
  const date = new Date().toLocaleDateString("en-GB");
  const propertyContext = property.property_name || property.address_line_1;

  return `Proposal for ${customer.first_name} ${customer.last_name} - ${propertyContext} - ${opportunity.title} - ${date}`;
}

function getValidUntil() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

export async function createOrOpenProposal(
  customerId: string,
  propertyId: string,
  opportunityId: string,
) {
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
      `/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}?error=owner-required`,
    );
  }

  const proposalRoute = `/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}/proposal`;

  const { data: currentProposalData } = await supabase
    .from("proposals")
    .select("id")
    .eq("business_id", appUser.business_id)
    .eq("customer_id", customerId)
    .eq("property_id", propertyId)
    .eq("opportunity_id", opportunityId)
    .eq("is_current", true)
    .is("archived_at", null)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const currentProposal = currentProposalData as { id: string } | null;

  if (currentProposal) {
    redirect(proposalRoute);
  }

  const [
    { data: businessData },
    { data: customerData },
    { data: propertyData },
    { data: opportunityData },
    { data: pricingData },
    { data: latestProposalData },
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select(
        "id, name, trading_name, email, phone, address_line_1, address_line_2, town, county, postcode, country, company_registration_number, vat_registration_number, short_company_description, public_contact_email, public_contact_phone",
      )
      .eq("id", appUser.business_id)
      .is("archived_at", null)
      .single(),
    supabase
      .from("customers")
      .select("id, first_name, last_name, email, phone")
      .eq("id", customerId)
      .eq("business_id", appUser.business_id)
      .is("archived_at", null)
      .single(),
    supabase
      .from("properties")
      .select("id, property_name, address_line_1, address_line_2, town, county, postcode")
      .eq("id", propertyId)
      .eq("customer_id", customerId)
      .eq("business_id", appUser.business_id)
      .is("archived_at", null)
      .single(),
    supabase
      .from("opportunities")
      .select("id, title, description, status, estimated_value, target_date")
      .eq("id", opportunityId)
      .eq("customer_id", customerId)
      .eq("property_id", propertyId)
      .eq("business_id", appUser.business_id)
      .is("archived_at", null)
      .single(),
    supabase
      .from("opportunity_pricing")
      .select("*")
      .eq("opportunity_id", opportunityId)
      .eq("customer_id", customerId)
      .eq("property_id", propertyId)
      .eq("business_id", appUser.business_id)
      .is("archived_at", null)
      .maybeSingle(),
    supabase
      .from("proposals")
      .select("version_number")
      .eq("opportunity_id", opportunityId)
      .eq("business_id", appUser.business_id)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const business = businessData as BusinessSnapshot | null;
  const customer = customerData as CustomerSnapshot | null;
  const property = propertyData as PropertySnapshot | null;
  const opportunity = opportunityData as OpportunitySnapshot | null;
  const pricing = pricingData as PricingSnapshot | null;
  const latestProposal = latestProposalData as { version_number: number } | null;

  if (!business || !customer || !property || !opportunity) {
    redirect(`/customers/${customerId}/properties/${propertyId}/opportunities`);
  }

  if (!pricing) {
    redirect(
      `/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}/pricing`,
    );
  }

  const calculatedPricing = calculatePricing(pricing);
  const validUntil = getValidUntil();
  const versionNumber = (latestProposal?.version_number ?? 0) + 1;

  const proposalInsert: ProposalInsert = {
    business_id: appUser.business_id,
    customer_id: customer.id,
    property_id: property.id,
    opportunity_id: opportunity.id,
    pricing_id: pricing.id,
    created_by_user_id: appUser.id,
    updated_by_user_id: appUser.id,
    version_number: versionNumber,
    is_current: true,
    status: "draft",
    title: getProposalTitle({ customer, opportunity, property }),
    structure_type: "single",
    recommended_option_number: 1,
    valid_until: validUntil,
    snapshot_business_name: business.name,
    snapshot_business_trading_name: business.trading_name,
    snapshot_business_contact_email: business.public_contact_email || business.email,
    snapshot_business_contact_phone: business.public_contact_phone || business.phone,
    snapshot_business_address_line_1: business.address_line_1,
    snapshot_business_address_line_2: business.address_line_2,
    snapshot_business_town: business.town,
    snapshot_business_county: business.county,
    snapshot_business_postcode: business.postcode,
    snapshot_business_country: business.country,
    snapshot_business_company_registration_number: business.company_registration_number,
    snapshot_business_vat_registration_number: business.vat_registration_number,
    snapshot_business_short_company_description: business.short_company_description,
    snapshot_customer_first_name: customer.first_name,
    snapshot_customer_last_name: customer.last_name,
    snapshot_customer_email: customer.email,
    snapshot_customer_phone: customer.phone,
    snapshot_property_name: property.property_name,
    snapshot_property_address_line_1: property.address_line_1,
    snapshot_property_address_line_2: property.address_line_2,
    snapshot_property_town: property.town,
    snapshot_property_county: property.county,
    snapshot_property_postcode: property.postcode,
    snapshot_opportunity_title: opportunity.title,
    snapshot_opportunity_description: opportunity.description,
    snapshot_opportunity_status: opportunity.status,
    snapshot_opportunity_estimated_value: opportunity.estimated_value,
    snapshot_opportunity_target_date: opportunity.target_date,
    snapshot_pricing_work_type: pricing.work_type,
    snapshot_pricing_customer_outcome: pricing.customer_outcome,
    snapshot_pricing_scope_notes: pricing.scope_notes,
    snapshot_pricing_assumptions: pricing.assumptions,
    snapshot_pricing_exclusions: pricing.exclusions,
    snapshot_pricing_proposal_notes: pricing.proposal_notes,
    snapshot_pricing_recommended_selling_price:
      calculatedPricing.recommendedSellingPrice,
    snapshot_pricing_cost_before_profit: calculatedPricing.costBeforeProfit,
    snapshot_pricing_projected_profit: calculatedPricing.projectedProfit,
    snapshot_pricing_profit_target_percent: pricing.target_margin_percent,
  };

  const { data: proposalData, error: proposalError } = await supabase
    .from("proposals")
    .insert([proposalInsert] as never[])
    .select("id, proposal_number")
    .single();
  const proposal = proposalData as { id: string; proposal_number: string } | null;

  if (proposalError || !proposal) {
    redirect(
      `/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}?error=proposal-create-failed`,
    );
  }

  const optionInsert: ProposalOptionInsert = {
    business_id: appUser.business_id,
    proposal_id: proposal.id,
    option_number: 1,
    label: "Option 1",
    title: opportunity.title,
    description: pricing.proposal_notes || pricing.scope_notes || opportunity.description,
    price: calculatedPricing.recommendedSellingPrice,
    is_recommended: true,
  };

  const { error: optionError } = await supabase
    .from("proposal_options")
    .insert([optionInsert] as never[]);

  if (optionError) {
    redirect(
      `/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}?error=proposal-create-failed`,
    );
  }

  const auditLogInsert: AuditLogInsert = {
    business_id: appUser.business_id,
    user_id: appUser.id,
    entity_type: "proposal",
    entity_id: proposal.id,
    action: "proposal.created",
    details: {
      proposal_id: proposal.id,
      proposal_number: proposal.proposal_number,
      opportunity_id: opportunity.id,
      pricing_id: pricing.id,
      version_number: versionNumber,
      structure_type: "single",
      option_count: 1,
      valid_until: validUntil,
      snapshot_recommended_selling_price:
        calculatedPricing.recommendedSellingPrice,
    },
  };

  await supabase.from("audit_logs").insert([auditLogInsert] as never[]);

  redirect(proposalRoute);
}

export async function updateProposalSection(
  customerId: string,
  propertyId: string,
  opportunityId: string,
  section: string,
  formData: FormData,
) {
  const sectionConfig = getProposalSectionConfig(section);
  const proposalRoute = `/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}/proposal`;

  if (!sectionConfig) {
    redirect(proposalRoute);
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
    redirect(`${proposalRoute}?error=owner-required`);
  }

  const rawContent = formData.get("content");
  const content =
    typeof rawContent === "string" && rawContent.trim().length > 0
      ? rawContent.trim()
      : null;

  const { data: proposalData } = await supabase
    .from("proposals")
    .select(`id, ${sectionConfig.field}`)
    .eq("business_id", appUser.business_id)
    .eq("customer_id", customerId)
    .eq("property_id", propertyId)
    .eq("opportunity_id", opportunityId)
    .eq("is_current", true)
    .is("archived_at", null)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();
  const proposal = proposalData as
    | ({ id: string } & Record<typeof sectionConfig.field, string | null>)
    | null;

  if (!proposal) {
    redirect(proposalRoute);
  }

  const previousContent = proposal[sectionConfig.field];
  const updatePayload = {
    [sectionConfig.field]: content,
    sections_updated_at: new Date().toISOString(),
    sections_updated_by_user_id: appUser.id,
    updated_by_user_id: appUser.id,
  } as ProposalUpdate;

  const { error: updateError } = await supabase
    .from("proposals")
    .update(updatePayload as never)
    .eq("id", proposal.id)
    .eq("business_id", appUser.business_id)
    .eq("customer_id", customerId)
    .eq("property_id", propertyId)
    .eq("opportunity_id", opportunityId)
    .eq("is_current", true)
    .is("archived_at", null);

  if (updateError) {
    redirect(`${proposalRoute}/edit/${section}?error=section-update-failed`);
  }

  const auditLogInsert: AuditLogInsert = {
    business_id: appUser.business_id,
    user_id: appUser.id,
    entity_type: "proposal",
    entity_id: proposal.id,
    action: "proposal.section.updated",
    details: {
      proposal_id: proposal.id,
      section_name: section,
      customer_id: customerId,
      property_id: propertyId,
      opportunity_id: opportunityId,
      had_previous_custom_content: Boolean(previousContent),
      has_new_custom_content: Boolean(content),
    },
  };

  await supabase.from("audit_logs").insert([auditLogInsert] as never[]);

  redirect(proposalRoute);
}
