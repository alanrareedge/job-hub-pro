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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidWebsite(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function updateBusinessProfile(formData: FormData) {
  const name = getString(formData, "name");
  const tradingName = getString(formData, "tradingName");
  const companyRegistrationNumber = getString(formData, "companyRegistrationNumber");
  const vatRegistrationNumber = getString(formData, "vatRegistrationNumber");
  const website = getString(formData, "website");
  const email = getString(formData, "email");
  const phone = getString(formData, "phone");
  const mobile = getString(formData, "mobile");
  const addressLine1 = getString(formData, "addressLine1");
  const addressLine2 = getString(formData, "addressLine2");
  const town = getString(formData, "town");
  const county = getString(formData, "county");
  const postcode = getString(formData, "postcode");
  const country = getString(formData, "country");
  const shortCompanyDescription = getString(formData, "shortCompanyDescription");
  const aboutBusiness = getString(formData, "aboutBusiness");
  const publicContactEmail = getString(formData, "publicContactEmail");
  const publicContactPhone = getString(formData, "publicContactPhone");

  if (!name) {
    redirect("/settings/business?error=missing-fields");
  }

  if (email && !isValidEmail(email)) {
    redirect("/settings/business?error=invalid-email");
  }

  if (publicContactEmail && !isValidEmail(publicContactEmail)) {
    redirect("/settings/business?error=invalid-public-email");
  }

  if (website && !isValidWebsite(website)) {
    redirect("/settings/business?error=invalid-website");
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
    trading_name: tradingName || null,
    company_registration_number: companyRegistrationNumber || null,
    vat_registration_number: vatRegistrationNumber || null,
    website: website || null,
    email: email || null,
    phone: phone || null,
    mobile: mobile || null,
    address_line_1: addressLine1 || null,
    address_line_2: addressLine2 || null,
    town: town || null,
    county: county || null,
    postcode: postcode || null,
    country: country || null,
    short_company_description: shortCompanyDescription || null,
    about_business: aboutBusiness || null,
    public_contact_email: publicContactEmail || null,
    public_contact_phone: publicContactPhone || null,
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
      trading_name: tradingName || null,
      company_registration_number: companyRegistrationNumber || null,
      vat_registration_number: vatRegistrationNumber || null,
      website: website || null,
      email: email || null,
      phone: phone || null,
      mobile: mobile || null,
      address_line_1: addressLine1 || null,
      address_line_2: addressLine2 || null,
      town: town || null,
      county: county || null,
      postcode: postcode || null,
      country: country || null,
      short_company_description: shortCompanyDescription || null,
      about_business: aboutBusiness || null,
      public_contact_email: publicContactEmail || null,
      public_contact_phone: publicContactPhone || null,
    },
  };

  await supabase.from("audit_logs").insert([auditLogInsert] as never[]);

  redirect("/settings/business?updated=true");
}
