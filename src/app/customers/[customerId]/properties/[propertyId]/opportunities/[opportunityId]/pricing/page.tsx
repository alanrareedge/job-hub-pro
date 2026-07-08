import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PricingForm } from "@/features/pricing/pricing-form";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

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

type OpportunitySummary = {
  id: string;
  title: string;
};

type PricingRecord = Database["public"]["Tables"]["opportunity_pricing"]["Row"];

type PricingPageProps = {
  params: Promise<{
    customerId: string;
    propertyId: string;
    opportunityId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "owner-required":
      return "Only owners can save pricing at this stage.";
    case "save-failed":
      return "We could not save the pricing. Please try again.";
    default:
      return null;
  }
}

function getNumber(value: number | null | undefined) {
  return value ?? 0;
}

function calculatePricing(pricing: PricingRecord | null) {
  const labourRateType = pricing?.labour_rate_type ?? "hourly";
  const labourPeopleCount = getNumber(pricing?.labour_people_count);
  const labourUnits = getNumber(pricing?.labour_units);
  const labourRate = getNumber(pricing?.labour_rate);
  const labourFixedCost = getNumber(pricing?.labour_fixed_cost);
  const materialsCost = getNumber(pricing?.materials_cost);
  const plantCost = getNumber(pricing?.plant_cost);
  const wasteCost = getNumber(pricing?.waste_cost);
  const subcontractorCost = getNumber(pricing?.subcontractor_cost);
  const otherCost = getNumber(pricing?.other_cost);
  const riskAllowancePercent = getNumber(pricing?.risk_allowance_percent);
  const targetMarginPercent = getNumber(pricing?.target_margin_percent);
  const labourCost =
    labourRateType === "fixed"
      ? labourFixedCost
      : labourPeopleCount * labourUnits * labourRate;
  const baseCost =
    labourCost +
    materialsCost +
    plantCost +
    wasteCost +
    subcontractorCost +
    otherCost;
  const riskAllowance = baseCost * (riskAllowancePercent / 100);
  const costBeforeMargin = baseCost + riskAllowance;
  const marginMultiplier = 1 - targetMarginPercent / 100;
  const recommendedSellingPrice =
    marginMultiplier > 0 ? costBeforeMargin / marginMultiplier : costBeforeMargin;
  const grossProfit = recommendedSellingPrice - costBeforeMargin;

  return {
    labourCost,
    materialsCost,
    plantCost,
    wasteCost,
    subcontractorCost,
    otherCost,
    baseCost,
    riskAllowance,
    costBeforeMargin,
    recommendedSellingPrice,
    grossProfit,
    targetMarginPercent,
  };
}

function getPricingConfidence(pricing: PricingRecord | null) {
  const labourRateType = pricing?.labour_rate_type ?? "hourly";
  const checks = [
    {
      passed:
        labourRateType === "fixed"
          ? getNumber(pricing?.labour_fixed_cost) > 0
          : getNumber(pricing?.labour_people_count) > 0 &&
            getNumber(pricing?.labour_units) > 0 &&
            getNumber(pricing?.labour_rate) > 0,
      label: "Labour complete",
    },
    {
      passed:
        getNumber(pricing?.materials_cost) > 0 ||
        getNumber(pricing?.plant_cost) > 0 ||
        getNumber(pricing?.waste_cost) > 0 ||
        getNumber(pricing?.subcontractor_cost) > 0 ||
        getNumber(pricing?.other_cost) > 0,
      label: "Costs considered",
    },
    {
      passed: getNumber(pricing?.risk_allowance_percent) > 0,
      label: "Risks considered",
    },
    {
      passed: getNumber(pricing?.target_margin_percent) >= 30,
      label: "Profit target healthy",
    },
    {
      passed: Boolean(pricing?.assumptions),
      label: "Assumptions recorded",
    },
    {
      passed: Boolean(pricing?.exclusions),
      label: "Exclusions recorded",
    },
  ];
  const passedCount = checks.filter((check) => check.passed).length;

  return {
    checks,
    score: Math.round((passedCount / checks.length) * 100),
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
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

export default async function PricingPage({ params, searchParams }: PricingPageProps) {
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
    .select("id, title")
    .eq("id", opportunityId)
    .eq("business_id", appUser.business_id)
    .eq("customer_id", customerId)
    .eq("property_id", property.id)
    .is("archived_at", null)
    .single();
  const opportunity = opportunityData as OpportunitySummary | null;

  if (!opportunity) {
    notFound();
  }

  const { data: pricingData } = await supabase
    .from("opportunity_pricing")
    .select("*")
    .eq("business_id", appUser.business_id)
    .eq("customer_id", customerId)
    .eq("property_id", property.id)
    .eq("opportunity_id", opportunity.id)
    .is("archived_at", null)
    .maybeSingle();
  const pricing = pricingData as PricingRecord | null;
  const calculations = calculatePricing(pricing);
  const confidence = getPricingConfidence(pricing);
  const query = await searchParams;
  const errorMessage = getErrorMessage(query?.error);

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          className="text-sm font-medium text-primary"
          href={`/customers/${customerId}/properties/${property.id}/opportunities/${opportunity.id}`}
        >
          Back to opportunity
        </Link>

        <div className="mb-6 mt-4">
          <p className="text-sm font-medium text-muted-foreground">
            {property.customers.first_name} {property.customers.last_name} -{" "}
            {getPropertyTitle(property)}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">
            Pricing Engine
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{opportunity.title}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Guided pricing</CardTitle>
                <CardDescription>
                  Price the outcome, make assumptions clear, and protect profit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PricingForm
                  customerId={customerId}
                  propertyId={property.id}
                  opportunityId={opportunity.id}
                  pricing={pricing}
                  errorMessage={errorMessage}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommendation</CardTitle>
                <CardDescription>{getPropertyAddress(property)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Labour</span>
                  <span className="font-medium">{formatCurrency(calculations.labourCost)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Materials</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.materialsCost)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Plant / equipment</span>
                  <span className="font-medium">{formatCurrency(calculations.plantCost)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Waste</span>
                  <span className="font-medium">{formatCurrency(calculations.wasteCost)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Subcontractors</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.subcontractorCost)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Other costs</span>
                  <span className="font-medium">{formatCurrency(calculations.otherCost)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Base cost</span>
                    <span className="font-medium">{formatCurrency(calculations.baseCost)}</span>
                  </div>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Risk allowance</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.riskAllowance)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Cost before profit</span>
                  <span className="font-medium">
                    {formatCurrency(calculations.costBeforeMargin)}
                  </span>
                </div>
                <div className="rounded-md bg-primary px-4 py-3 text-primary-foreground">
                  <div className="text-sm opacity-90">Recommended selling price</div>
                  <div className="text-2xl font-semibold">
                    {formatCurrency(calculations.recommendedSellingPrice)}
                  </div>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Projected profit</span>
                  <span className="font-medium">{formatCurrency(calculations.grossProfit)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Profit target</span>
                  <span className="font-medium">
                    {calculations.targetMarginPercent.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing confidence</CardTitle>
                <CardDescription>{confidence.score}% complete</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {confidence.checks.map((check) => (
                    <div
                      className="flex items-center justify-between gap-3"
                      key={check.label}
                    >
                      <span className="text-muted-foreground">{check.label}</span>
                      <span className="font-medium">{check.passed ? "Yes" : "No"}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
