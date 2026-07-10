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

type ProposalSummary = {
  id: string;
  proposal_number: string;
  title: string;
  status: string;
  version_number: number;
  valid_until: string;
  snapshot_pricing_recommended_selling_price: number;
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
  return new Date(value).toLocaleDateString("en-GB");
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
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
      "id, proposal_number, title, status, version_number, valid_until, snapshot_pricing_recommended_selling_price",
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
  const proposal = proposalData as ProposalSummary | null;

  if (!proposal) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          className="text-sm font-medium text-primary"
          href={`/customers/${customerId}/properties/${propertyId}/opportunities/${opportunityId}`}
        >
          Back to opportunity
        </Link>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Proposal draft</CardTitle>
            <CardDescription>
              Phase 8A has created the proposal snapshot. Preview and Builder arrive in later phases.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-foreground">Proposal number</p>
              <p className="text-muted-foreground">{proposal.proposal_number}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Title</p>
              <p className="text-muted-foreground">{proposal.title}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="font-medium text-foreground">Status</p>
                <p className="text-muted-foreground">{formatLabel(proposal.status)}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Version</p>
                <p className="text-muted-foreground">{proposal.version_number}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Valid until</p>
                <p className="text-muted-foreground">{formatDate(proposal.valid_until)}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Snapshot price</p>
                <p className="text-muted-foreground">
                  {formatCurrency(proposal.snapshot_pricing_recommended_selling_price)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
