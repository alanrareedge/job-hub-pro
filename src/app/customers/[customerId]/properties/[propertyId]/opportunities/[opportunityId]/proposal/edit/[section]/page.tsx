import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateProposalSection } from "../../actions";
import { Button } from "@/components/ui/button";
import { getProposalSectionConfig } from "@/lib/proposal-sections";
import { createClient } from "@/lib/supabase/server";

type CurrentAppUser = {
  id: string;
  business_id: string;
  role: "owner" | "office" | "operative";
};

type ProposalEdit = {
  id: string;
  section_assumptions: string | null;
  section_exclusions: string | null;
  section_next_steps: string | null;
  section_recommendation: string | null;
  section_scope: string | null;
  section_understanding: string | null;
  snapshot_opportunity_description: string | null;
  snapshot_opportunity_title: string;
  snapshot_pricing_assumptions: string | null;
  snapshot_pricing_customer_outcome: string | null;
  snapshot_pricing_exclusions: string | null;
  snapshot_pricing_scope_notes: string | null;
  snapshot_pricing_work_type: string | null;
};

type ProposalSectionEditPageProps = {
  params: Promise<{
    customerId: string;
    propertyId: string;
    opportunityId: string;
    section: string;
  }>;
};

function getRecommendation(proposal: ProposalEdit) {
  const title = proposal.snapshot_opportunity_title;
  const workType = proposal.snapshot_pricing_work_type;

  if (workType) {
    return `Based on what you have told us, we recommend completing the ${workType} for ${title}. This gives you a clear route from the current requirement to the result you want, with the scope and investment set out before work begins.`;
  }

  return `Based on what you have told us, we recommend moving forward with ${title}. This gives you a clear route from the current requirement to the result you want, with the scope and investment set out before work begins.`;
}

function getFallbackContent(section: string, proposal: ProposalEdit) {
  switch (section) {
    case "understanding":
      return (
        proposal.snapshot_pricing_customer_outcome ||
        proposal.snapshot_opportunity_description ||
        "We will refine this section during proposal editing so the finished proposal clearly reflects what matters most to the customer."
      );
    case "recommendation":
      return getRecommendation(proposal);
    case "scope":
      return (
        proposal.snapshot_pricing_scope_notes ||
        "Scope will be completed during proposal editing."
      );
    case "assumptions":
      return proposal.snapshot_pricing_assumptions || "No assumptions have been added.";
    case "exclusions":
      return proposal.snapshot_pricing_exclusions || "No exclusions have been added.";
    case "next-steps":
      return "If you are happy to proceed we will contact you to arrange the next steps.";
    default:
      return "";
  }
}

export default async function ProposalSectionEditPage({
  params,
}: ProposalSectionEditPageProps) {
  const { customerId, propertyId, opportunityId, section } = await params;
  const sectionConfig = getProposalSectionConfig(section);

  if (!sectionConfig) {
    notFound();
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

  const proposalRoute = `/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}/proposal`;

  if (appUser.role !== "owner") {
    redirect(`${proposalRoute}?error=owner-required`);
  }

  const { data: proposalData } = await supabase
    .from("proposals")
    .select(
      [
        "id",
        "section_assumptions",
        "section_exclusions",
        "section_next_steps",
        "section_recommendation",
        "section_scope",
        "section_understanding",
        "snapshot_opportunity_description",
        "snapshot_opportunity_title",
        "snapshot_pricing_assumptions",
        "snapshot_pricing_customer_outcome",
        "snapshot_pricing_exclusions",
        "snapshot_pricing_scope_notes",
        "snapshot_pricing_work_type",
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
  const proposal = proposalData as ProposalEdit | null;

  if (!proposal) {
    notFound();
  }

  const currentContent =
    proposal[sectionConfig.field] || getFallbackContent(section, proposal);
  const updateSection = updateProposalSection.bind(
    null,
    customerId,
    propertyId,
    opportunityId,
    section,
  );

  return (
    <main className="min-h-screen bg-background px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <form action={updateSection} className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {sectionConfig.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {sectionConfig.question}
            </p>
          </div>

          <textarea
            className="min-h-72 w-full rounded-md border border-input bg-background px-3 py-3 text-base leading-7 text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={currentContent}
            name="content"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit">Save</Button>
            <Button asChild type="button" variant="outline">
              <Link href={proposalRoute}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
