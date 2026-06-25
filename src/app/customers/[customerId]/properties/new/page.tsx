import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PropertyForm } from "@/features/properties/property-form";
import { createClient } from "@/lib/supabase/server";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type CustomerSummary = {
  id: string;
  first_name: string;
  last_name: string;
};

type NewPropertyPageProps = {
  params: Promise<{
    customerId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-fields":
      return "Address line 1 and postcode are required.";
    case "create-failed":
      return "We could not create the property. Please try again.";
    default:
      return null;
  }
}

export default async function NewPropertyPage({
  params,
  searchParams,
}: NewPropertyPageProps) {
  const { customerId } = await params;
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

  const { data: customerData } = await supabase
    .from("customers")
    .select("id, first_name, last_name")
    .eq("id", customerId)
    .eq("business_id", appUser.business_id)
    .is("archived_at", null)
    .single();
  const customer = customerData as CustomerSummary | null;

  if (!customer) {
    redirect("/customers?error=customer-not-found");
  }

  const query = await searchParams;

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          className="text-sm font-medium text-primary"
          href={`/customers/${customer.id}/properties`}
        >
          Back to properties
        </Link>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Add property</CardTitle>
            <CardDescription>
              Create a property for {customer.first_name} {customer.last_name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PropertyForm
              customerId={customer.id}
              errorMessage={getErrorMessage(query?.error)}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
