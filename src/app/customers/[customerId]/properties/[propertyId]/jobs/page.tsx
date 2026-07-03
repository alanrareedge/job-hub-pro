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

type PropertyContext = {
  id: string;
  property_name: string | null;
  address_line_1: string;
  postcode: string;
  customers: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};

type JobListItem = {
  id: string;
  title: string;
  reference: string | null;
  description: string | null;
  status: "new" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "normal" | "urgent";
  target_date: string | null;
  created_at: string;
};

type PropertyJobsPageProps = {
  params: Promise<{
    customerId: string;
    propertyId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "owner-required") {
    return "Only owners can create jobs at this stage.";
  }

  return null;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function getPropertyTitle(property: PropertyContext) {
  return property.property_name || property.address_line_1;
}

export default async function PropertyJobsPage({
  params,
  searchParams,
}: PropertyJobsPageProps) {
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
    .select("id, property_name, address_line_1, postcode, customers(id, first_name, last_name)")
    .eq("id", propertyId)
    .eq("customer_id", customerId)
    .eq("business_id", appUser.business_id)
    .is("archived_at", null)
    .single();
  const property = propertyData as PropertyContext | null;

  if (!property || !property.customers) {
    redirect(`/customers/${customerId}/properties?error=property-not-found`);
  }

  const { data: jobData } = await supabase
    .from("jobs")
    .select("id, title, reference, description, status, priority, target_date, created_at")
    .eq("business_id", appUser.business_id)
    .eq("customer_id", customerId)
    .eq("property_id", property.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  const jobs = (jobData ?? []) as JobListItem[];
  const query = await searchParams;
  const errorMessage = getErrorMessage(query?.error);

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          className="text-sm font-medium text-primary"
          href={`/customers/${customerId}/properties`}
        >
          Back to properties
        </Link>

        <div className="mb-6 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {property.customers.first_name} {property.customers.last_name} -{" "}
              {getPropertyTitle(property)}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Jobs</h1>
          </div>
          <Button asChild>
            <Link href={`/customers/${customerId}/properties/${property.id}/jobs/new`}>
              Add job
            </Link>
          </Button>
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {jobs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No jobs yet</CardTitle>
              <CardDescription>Add the first job for this property.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/customers/${customerId}/properties/${property.id}/jobs/new`}>
                  Add job
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription>
                    Added {new Date(job.created_at).toLocaleDateString("en-GB")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <span>Status: {formatLabel(job.status)}</span>
                    <span>Priority: {formatLabel(job.priority)}</span>
                    <span>Reference: {job.reference || "Not provided"}</span>
                    <span>
                      Target date:{" "}
                      {job.target_date
                        ? new Date(job.target_date).toLocaleDateString("en-GB")
                        : "Not provided"}
                    </span>
                  </div>
                  {job.description ? (
                    <p className="text-sm text-muted-foreground">{job.description}</p>
                  ) : null}
                  <div>
                    <Button asChild variant="outline">
                      <Link
                        href={`/customers/${customerId}/properties/${property.id}/jobs/${job.id}`}
                      >
                        View
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
