import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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

type PropertyContext = {
  id: string;
  property_name: string | null;
  address_line_1: string;
  address_line_2: string | null;
  town: string | null;
  county: string | null;
  postcode: string;
  customers: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};

type OpportunityDetail = {
  id: string;
  title: string;
  description: string | null;
  status: "new" | "site_visit_required" | "pricing" | "proposal_sent" | "won" | "lost";
  estimated_value: number | null;
  target_date: string | null;
  created_at: string;
};

type OpportunityDetailPageProps = {
  params: Promise<{
    customerId: string;
    propertyId: string;
    opportunityId: string;
  }>;
};

const placeholderSections = [
  {
    title: "Proposal Builder",
    description: "Coming in a future phase.",
  },
  {
    title: "Convert to Job",
    description: "Available once the proposal is accepted.",
  },
];

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatCurrency(value: number | null) {
  return value === null
    ? "Not provided"
    : new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
      }).format(value);
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString("en-GB") : "Not provided";
}

function getPropertyTitle(property: PropertyContext) {
  return property.property_name || property.address_line_1;
}

function getPropertyAddress(property: PropertyContext) {
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

export default async function OpportunityDetailPage({
  params,
}: OpportunityDetailPageProps) {
  const { customerId, propertyId, opportunityId } = await params;
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
    .select(
      "id, property_name, address_line_1, address_line_2, town, county, postcode, customers(id, first_name, last_name)",
    )
    .eq("id", propertyId)
    .eq("customer_id", customerId)
    .eq("business_id", appUser.business_id)
    .is("archived_at", null)
    .single();
  const property = propertyData as PropertyContext | null;

  if (!property || !property.customers) {
    notFound();
  }

  const { data: opportunityData } = await supabase
    .from("opportunities")
    .select("id, title, description, status, estimated_value, target_date, created_at")
    .eq("id", opportunityId)
    .eq("business_id", appUser.business_id)
    .eq("customer_id", customerId)
    .eq("property_id", property.id)
    .is("archived_at", null)
    .single();
  const opportunity = opportunityData as OpportunityDetail | null;

  if (!opportunity) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          className="text-sm font-medium text-primary"
          href={`/customers/${customerId}/properties/${property.id}/opportunities`}
        >
          Back to opportunities
        </Link>

        <div className="mb-6 mt-4">
          <p className="text-sm font-medium text-muted-foreground">
            {property.customers.first_name} {property.customers.last_name} -{" "}
            {getPropertyTitle(property)}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">
            {opportunity.title}
          </h1>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity summary</CardTitle>
                <CardDescription>{getPropertyAddress(property)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-foreground">Status</p>
                    <p className="text-muted-foreground">
                      {formatLabel(opportunity.status)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Estimated value</p>
                    <p className="text-muted-foreground">
                      {formatCurrency(opportunity.estimated_value)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Target date</p>
                    <p className="text-muted-foreground">
                      {formatDate(opportunity.target_date)}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Created</p>
                    <p className="text-muted-foreground">
                      {formatDate(opportunity.created_at)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-foreground">Description</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {opportunity.description || "Not provided"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Engine</CardTitle>
                <CardDescription>
                  Work out what to charge before creating a proposal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link
                    href={`/customers/${customerId}/properties/${property.id}/opportunities/${opportunity.id}/pricing`}
                  >
                    Open Pricing Engine
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {placeholderSections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
                <CardDescription>
                  {property.customers.first_name} {property.customers.last_name}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property</CardTitle>
                <CardDescription>{getPropertyAddress(property)}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
