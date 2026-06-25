import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JobForm } from "@/features/jobs/job-form";
import { createClient } from "@/lib/supabase/server";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type PropertyContext = {
  id: string;
  property_name: string | null;
  address_line_1: string;
  customers: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};

type NewJobPageProps = {
  params: Promise<{
    customerId: string;
    propertyId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-fields":
      return "Title is required.";
    case "create-failed":
      return "We could not create the job. Please try again.";
    default:
      return null;
  }
}

function getPropertyTitle(property: PropertyContext) {
  return property.property_name || property.address_line_1;
}

export default async function NewJobPage({ params, searchParams }: NewJobPageProps) {
  const { customerId, propertyId } = await params;
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

  const { data: propertyData } = await supabase
    .from("properties")
    .select("id, property_name, address_line_1, customers(id, first_name, last_name)")
    .eq("id", propertyId)
    .eq("customer_id", customerId)
    .eq("business_id", appUser.business_id)
    .is("archived_at", null)
    .single();
  const property = propertyData as PropertyContext | null;

  if (!property || !property.customers) {
    redirect(`/customers/${customerId}/properties?error=property-not-found`);
  }

  const query = await searchParams;

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          className="text-sm font-medium text-primary"
          href={`/customers/${customerId}/properties/${property.id}/jobs`}
        >
          Back to jobs
        </Link>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Add job</CardTitle>
            <CardDescription>
              Create a job for {property.customers.first_name}{" "}
              {property.customers.last_name} at {getPropertyTitle(property)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobForm
              customerId={customerId}
              propertyId={property.id}
              errorMessage={getErrorMessage(query?.error)}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
