import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

import { createClient } from "@/lib/supabase/server";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type ProposalPreview = {
  id: string;
  proposal_number: string;
  section_assumptions: string | null;
  section_exclusions: string | null;
  section_next_steps: string | null;
  section_recommendation: string | null;
  section_scope: string | null;
  section_understanding: string | null;
  title: string;
  status: string;
  valid_until: string;
  snapshot_business_name: string;
  snapshot_customer_first_name: string;
  snapshot_customer_last_name: string;
  snapshot_opportunity_description: string | null;
  snapshot_opportunity_title: string;
  snapshot_pricing_assumptions: string | null;
  snapshot_pricing_customer_outcome: string | null;
  snapshot_pricing_exclusions: string | null;
  snapshot_pricing_scope_notes: string | null;
  snapshot_pricing_work_type: string | null;
  snapshot_property_address_line_1: string;
  snapshot_property_address_line_2: string | null;
  snapshot_property_county: string | null;
  snapshot_property_name: string | null;
  snapshot_property_postcode: string;
  snapshot_property_town: string | null;
};

type ProposalOption = {
  description: string | null;
  label: string;
  price: number;
  title: string;
};

type ProposalPageProps = {
  params: Promise<{
    customerId: string;
    propertyId: string;
    opportunityId: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatStatus(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function joinLines(values: Array<string | null>) {
  return values.filter(Boolean).join(", ");
}

function getPreparedFor(proposal: ProposalPreview) {
  return `${proposal.snapshot_customer_first_name} ${proposal.snapshot_customer_last_name}`;
}

function getPropertyAddress(proposal: ProposalPreview) {
  return joinLines([
    proposal.snapshot_property_name,
    proposal.snapshot_property_address_line_1,
    proposal.snapshot_property_address_line_2,
    proposal.snapshot_property_town,
    proposal.snapshot_property_county,
    proposal.snapshot_property_postcode,
  ]);
}

function getUnderstanding(proposal: ProposalPreview) {
  return (
    proposal.snapshot_pricing_customer_outcome ||
    proposal.snapshot_opportunity_description ||
    "We will refine this section during proposal editing so the finished proposal clearly reflects what matters most to the customer."
  );
}

function getRecommendation(proposal: ProposalPreview) {
  const title = proposal.snapshot_opportunity_title;
  const workType = proposal.snapshot_pricing_work_type;

  if (workType) {
    return `Based on what you have told us, we recommend completing the ${workType} for ${title}. This gives you a clear route from the current requirement to the result you want, with the scope and investment set out before work begins.`;
  }

  return `Based on what you have told us, we recommend moving forward with ${title}. This gives you a clear route from the current requirement to the result you want, with the scope and investment set out before work begins.`;
}

function ProposalSection({
  children,
  editHref,
  title,
}: {
  children: ReactNode;
  editHref?: string;
  title: string;
}) {
  return (
    <section className="border-t border-border pt-8">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {editHref ? (
          <Link className="text-sm font-medium text-primary" href={editHref}>
            Edit
          </Link>
        ) : null}
      </div>
      <div className="mt-4 text-base leading-8 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function ProposalText({ children }: { children: string }) {
  return <p className="whitespace-pre-line">{children}</p>;
}

export default async function ProposalPage({ params }: ProposalPageProps) {
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

  const { data: proposalData } = await supabase
    .from("proposals")
    .select(
      [
        "id",
        "proposal_number",
        "section_assumptions",
        "section_exclusions",
        "section_next_steps",
        "section_recommendation",
        "section_scope",
        "section_understanding",
        "title",
        "status",
        "valid_until",
        "snapshot_business_name",
        "snapshot_customer_first_name",
        "snapshot_customer_last_name",
        "snapshot_opportunity_description",
        "snapshot_opportunity_title",
        "snapshot_pricing_assumptions",
        "snapshot_pricing_customer_outcome",
        "snapshot_pricing_exclusions",
        "snapshot_pricing_scope_notes",
        "snapshot_pricing_work_type",
        "snapshot_property_address_line_1",
        "snapshot_property_address_line_2",
        "snapshot_property_county",
        "snapshot_property_name",
        "snapshot_property_postcode",
        "snapshot_property_town",
      ].join(", "),
    )
    .eq("business_id", appUser.business_id)
    .eq("customer_id", customerId)
    .eq("property_id", propertyId)
    .eq("opportunity_id", opportunityId)
    .eq("is_current", true)
    .is("archived_at", null)
    .order("version_number", { ascending: false })
    .limit(1)
    .single();
  const proposal = proposalData as ProposalPreview | null;

  if (!proposal) {
    notFound();
  }

  const { data: optionData } = await supabase
    .from("proposal_options")
    .select("label, title, description, price")
    .eq("business_id", appUser.business_id)
    .eq("proposal_id", proposal.id)
    .eq("option_number", 1)
    .is("archived_at", null)
    .single();
  const option = optionData as ProposalOption | null;

  if (!option) {
    notFound();
  }

  const opportunityHref = `/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}`;
  const editHref = `${opportunityHref}/proposal/edit`;

  return (
    <main className="min-h-screen bg-background px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          className="text-sm font-medium text-primary"
          href={opportunityHref}
        >
          Back to Opportunity
        </Link>

        <article className="mt-8 rounded-lg bg-card px-6 py-8 shadow-sm sm:px-10 sm:py-12">
          <header>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Proposal {proposal.proposal_number}
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {proposal.title}
                </h1>
              </div>
              <span className="w-fit rounded-full bg-muted px-3 py-1 text-sm font-medium text-foreground">
                {formatStatus(proposal.status)}
              </span>
            </div>

            <dl className="mt-10 grid gap-5 border-t border-border pt-6 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="font-medium text-foreground">Valid Until</dt>
                <dd className="mt-1 text-muted-foreground">
                  {formatDate(proposal.valid_until)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Prepared For</dt>
                <dd className="mt-1 text-muted-foreground">
                  {getPreparedFor(proposal)}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Prepared By</dt>
                <dd className="mt-1 text-muted-foreground">
                  {proposal.snapshot_business_name}
                </dd>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="font-medium text-foreground">
                  Property Address
                </dt>
                <dd className="mt-1 text-muted-foreground">
                  {getPropertyAddress(proposal)}
                </dd>
              </div>
            </dl>
          </header>

          <div className="mt-12 space-y-10">
            <ProposalSection
              editHref={`${editHref}/understanding`}
              title="Understanding Your Project"
            >
              <ProposalText>
                {proposal.section_understanding || getUnderstanding(proposal)}
              </ProposalText>
            </ProposalSection>

            <ProposalSection
              editHref={`${editHref}/recommendation`}
              title="Our Recommendation"
            >
              <ProposalText>
                {proposal.section_recommendation || getRecommendation(proposal)}
              </ProposalText>
            </ProposalSection>

            <ProposalSection
              editHref={`${editHref}/scope`}
              title="Scope of Work"
            >
              <ProposalText>
                {proposal.section_scope ||
                  proposal.snapshot_pricing_scope_notes ||
                  "Scope will be completed during proposal editing."}
              </ProposalText>
            </ProposalSection>

            <ProposalSection title="Your Investment">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {option.label}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    {option.title}
                  </h3>
                </div>
                <p className="whitespace-pre-line">
                  {option.description ||
                    "A short description will be added during proposal editing."}
                </p>
                <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {formatCurrency(option.price)}
                </p>
              </div>
            </ProposalSection>

            <ProposalSection
              editHref={`${editHref}/assumptions`}
              title="Assumptions"
            >
              <ProposalText>
                {proposal.section_assumptions ||
                  proposal.snapshot_pricing_assumptions ||
                  "No assumptions have been added."}
              </ProposalText>
            </ProposalSection>

            <ProposalSection
              editHref={`${editHref}/exclusions`}
              title="Exclusions"
            >
              <ProposalText>
                {proposal.section_exclusions ||
                  proposal.snapshot_pricing_exclusions ||
                  "No exclusions have been added."}
              </ProposalText>
            </ProposalSection>

            <ProposalSection
              editHref={`${editHref}/next-steps`}
              title="What Happens Next"
            >
              <ProposalText>
                {proposal.section_next_steps ||
                  "If you are happy to proceed we will contact you to arrange the next steps."}
              </ProposalText>
            </ProposalSection>
          </div>
        </article>
      </div>
    </main>
  );
}
