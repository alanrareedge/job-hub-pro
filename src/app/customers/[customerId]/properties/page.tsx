import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type PropertyListItem = {
  id: string;
  property_name: string | null;
  address_line_1: string;
  address_line_2: string | null;
  town: string | null;
  county: string | null;
  postcode: string;
  created_at: string;
};

type CustomerPropertiesPageProps = {
  params: Promise<{
    customerId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "owner-required") {
    return "Only owners can create properties at this stage.";
  }

  if (error === "property-not-found") {
    return "We could not find that property in this workspace.";
  }

  return null;
}

function getPropertyTitle(property: PropertyListItem) {
  return property.property_name || property.address_line_1;
}

function getPropertyAddress(property: PropertyListItem) {
  return [
    property.address_line_1,
    property.address_line_2,
    property.town,
    property.county,
    property.postcode,
  ]
    .filter(Boolean)
    .join(", ");
}

export default async function CustomerPropertiesPage({
  params,
  searchParams,
}: CustomerPropertiesPageProps) {
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

  const { data: propertyData } = await supabase
    .from("properties")
    .select(
      "id, property_name, address_line_1, address_line_2, town, county, postcode, created_at",
    )
    .eq("business_id", appUser.business_id)
    .eq("customer_id", customer.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  const properties = (propertyData ?? []) as PropertyListItem[];
  const query = await searchParams;
  const errorMessage = getErrorMessage(query?.error);

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link className="text-sm font-medium text-primary" href="/customers">
          Back to customers
        </Link>

        <div className="mb-6 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {customer.first_name} {customer.last_name}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Properties</h1>
          </div>
          <Button asChild>
            <Link href={`/customers/${customer.id}/properties/new`}>Add property</Link>
          </Button>
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {properties.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No properties yet</CardTitle>
              <CardDescription>Add the first property for this customer.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/customers/${customer.id}/properties/new`}>Add property</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{getPropertyTitle(property)}</CardTitle>
                  <CardDescription>
                    Added {new Date(property.created_at).toLocaleDateString("en-GB")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {getPropertyAddress(property)}
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="outline">
                      <Link
                        href={`/customers/${customer.id}/properties/${property.id}/opportunities`}
                      >
                        Opportunities
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/customers/${customer.id}/properties/${property.id}/jobs`}>
                        Jobs
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
