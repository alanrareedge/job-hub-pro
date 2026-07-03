import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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

type JobDetail = {
  id: string;
  title: string;
  reference: string | null;
  description: string | null;
  status: "new" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "normal" | "urgent";
  target_date: string | null;
  created_at: string;
};

type JobDetailPageProps = {
  params: Promise<{
    customerId: string;
    propertyId: string;
    jobId: string;
  }>;
};

const placeholderSections = [
  {
    title: "Timeline",
    description:
      "Future events such as calls, texts, emails, photos, notes, payments and signatures will appear here.",
  },
  {
    title: "Notes",
    description: "Job notes will appear here in a future phase.",
  },
  {
    title: "Photos & Documents",
    description: "Files, photos and documents will appear here in a future phase.",
  },
  {
    title: "Deposits & Payments",
    description: "Deposit and payment activity will appear here in a future phase.",
  },
  {
    title: "Sign-offs",
    description: "Customer approvals and sign-offs will appear here in a future phase.",
  },
];

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
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

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { customerId, propertyId, jobId } = await params;
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

  const { data: jobData } = await supabase
    .from("jobs")
    .select("id, title, reference, description, status, priority, target_date, created_at")
    .eq("id", jobId)
    .eq("business_id", appUser.business_id)
    .eq("customer_id", customerId)
    .eq("property_id", property.id)
    .is("archived_at", null)
    .single();
  const job = jobData as JobDetail | null;

  if (!job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          className="text-sm font-medium text-primary"
          href={`/customers/${customerId}/properties/${property.id}/jobs`}
        >
          Back to jobs
        </Link>

        <div className="mb-6 mt-4">
          <p className="text-sm font-medium text-muted-foreground">
            {property.customers.first_name} {property.customers.last_name} -{" "}
            {getPropertyTitle(property)}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">{job.title}</h1>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job summary</CardTitle>
                <CardDescription>{getPropertyAddress(property)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-foreground">Reference</p>
                    <p className="text-muted-foreground">
                      {job.reference || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Status</p>
                    <p className="text-muted-foreground">{formatLabel(job.status)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Priority</p>
                    <p className="text-muted-foreground">{formatLabel(job.priority)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Target date</p>
                    <p className="text-muted-foreground">{formatDate(job.target_date)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Created</p>
                    <p className="text-muted-foreground">{formatDate(job.created_at)}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-foreground">Description</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {job.description || "Not provided"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>
                  Future events such as calls, texts, emails, photos, notes, payments and
                  signatures will appear here.
                </CardDescription>
              </CardHeader>
            </Card>
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

            {placeholderSections.slice(1).map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
