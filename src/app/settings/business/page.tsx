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
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  town: string | null;
  postcode: string | null;
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
    case "owner-required":
      return "Only owners can update business details.";
    case "update-failed":
      return "We could not update the business details. Please try again.";
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
    .select("id, name, email, phone, address_line_1, address_line_2, town, postcode")
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
    query?.updated === "true" ? "Business details updated." : null;

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link className="text-sm font-medium text-primary" href="/settings">
          Back to settings
        </Link>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Business details</CardTitle>
            <CardDescription>
              Keep the core business information accurate for this workspace.
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
