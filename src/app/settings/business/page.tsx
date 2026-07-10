import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BusinessDetailsForm } from "@/features/settings/business-details-form";
import { createClient } from "@/lib/supabase/server";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type BusinessDetails = {
  id: string;
  name: string;
  trading_name: string | null;
  company_registration_number: string | null;
  vat_registration_number: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  town: string | null;
  county: string | null;
  postcode: string | null;
  country: string | null;
  short_company_description: string | null;
  about_business: string | null;
  public_contact_email: string | null;
  public_contact_phone: string | null;
};

type BusinessSettingsPageProps = {
  searchParams?: Promise<{
    error?: string;
    updated?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-fields":
      return "Business name is required.";
    case "invalid-email":
      return "Enter a valid email address.";
    case "invalid-public-email":
      return "Enter a valid public contact email address.";
    case "invalid-website":
      return "Enter a valid website URL starting with http:// or https://.";
    case "owner-required":
      return "Only owners can update the business profile.";
    case "update-failed":
      return "We could not update the business profile. Please try again.";
    default:
      return null;
  }
}

export default async function BusinessSettingsPage({
  searchParams,
}: BusinessSettingsPageProps) {
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

  const { data: businessData } = await supabase
    .from("businesses")
    .select(
      "id, name, trading_name, company_registration_number, vat_registration_number, website, email, phone, mobile, address_line_1, address_line_2, town, county, postcode, country, short_company_description, about_business, public_contact_email, public_contact_phone",
    )
    .eq("id", appUser.business_id)
    .is("archived_at", null)
    .single();
  const business = businessData as BusinessDetails | null;

  if (!business) {
    await supabase.auth.signOut();
    redirect("/login?error=workspace-not-found");
  }

  const query = await searchParams;
  const errorMessage = getErrorMessage(query?.error);
  const successMessage =
    query?.updated === "true" ? "Business profile updated." : null;

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link className="text-sm font-medium text-primary" href="/settings">
          Back to settings
        </Link>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Business Profile</CardTitle>
            <CardDescription>
              Keep the business identity accurate for this workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessDetailsForm
              business={business}
              canEdit={appUser.role === "owner"}
              errorMessage={errorMessage}
              successMessage={successMessage}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
