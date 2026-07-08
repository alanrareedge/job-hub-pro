"use client";

import { useState } from "react";

import { savePricing } from "@/app/customers/[customerId]/properties/[propertyId]/opportunities/[opportunityId]/pricing/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/types/database";

type PricingRecord = Database["public"]["Tables"]["opportunity_pricing"]["Row"];
type LabourRateType = PricingRecord["labour_rate_type"];

type PricingFormProps = {
  customerId: string;
  propertyId: string;
  opportunityId: string;
  pricing: PricingRecord | null;
  errorMessage?: string | null;
};

function getDefaultNumber(value: number | undefined, fallback = 0) {
  return value ?? fallback;
}

export function PricingForm({
  customerId,
  propertyId,
  opportunityId,
  pricing,
  errorMessage,
}: PricingFormProps) {
  const action = savePricing.bind(null, customerId, propertyId, opportunityId);
  const [labourRateType, setLabourRateType] = useState<LabourRateType>(
    pricing?.labour_rate_type ?? "hourly",
  );
  const isFixedLabour = labourRateType === "fixed";
  const labourUnitsLabel = labourRateType === "daily" ? "Days" : "Hours each";
  const labourRateLabel = labourRateType === "daily" ? "Day rate" : "Hourly rate";

  return (
    <form action={action} className="space-y-5">
      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="work-type">What type of work is this?</Label>
          <Input id="work-type" name="workType" defaultValue={pricing?.work_type ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer-outcome">What outcome is the customer buying?</Label>
          <textarea
            id="customer-outcome"
            name="customerOutcome"
            defaultValue={pricing?.customer_outcome ?? ""}
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scope-notes">What is involved?</Label>
          <textarea
            id="scope-notes"
            name="scopeNotes"
            defaultValue={pricing?.scope_notes ?? ""}
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-md border bg-background p-4">
        <div>
          <h2 className="text-lg font-semibold tracking-normal">Cost Builder</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Build up the real cost before applying risk and profit.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="labour-rate-type">Rate type</Label>
          <select
            id="labour-rate-type"
            name="labourRateType"
            value={labourRateType}
            onChange={(event) => setLabourRateType(event.target.value as LabourRateType)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>

        {isFixedLabour ? (
          <div className="space-y-2">
            <Label htmlFor="labour-fixed-cost">Labour cost</Label>
            <Input
              id="labour-fixed-cost"
              name="labourFixedCost"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue={getDefaultNumber(pricing?.labour_fixed_cost)}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="labour-people-count">Number of people</Label>
              <Input
                id="labour-people-count"
                name="labourPeopleCount"
                type="number"
                min="0"
                step="0.25"
                inputMode="decimal"
                defaultValue={getDefaultNumber(pricing?.labour_people_count, 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labour-units">{labourUnitsLabel}</Label>
              <Input
                id="labour-units"
                name="labourUnits"
                type="number"
                min="0"
                step="0.25"
                inputMode="decimal"
                defaultValue={getDefaultNumber(pricing?.labour_units)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labour-rate">{labourRateLabel}</Label>
              <Input
                id="labour-rate"
                name="labourRate"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                defaultValue={getDefaultNumber(pricing?.labour_rate)}
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="materials-cost">Materials</Label>
            <Input
              id="materials-cost"
              name="materialsCost"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue={getDefaultNumber(pricing?.materials_cost)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plant-cost">Plant / equipment</Label>
            <Input
              id="plant-cost"
              name="plantCost"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue={getDefaultNumber(pricing?.plant_cost)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="waste-cost">Waste</Label>
            <Input
              id="waste-cost"
              name="wasteCost"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue={getDefaultNumber(pricing?.waste_cost)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcontractor-cost">Subcontractors</Label>
            <Input
              id="subcontractor-cost"
              name="subcontractorCost"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue={getDefaultNumber(pricing?.subcontractor_cost)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="other-cost">Other costs</Label>
            <Input
              id="other-cost"
              name="otherCost"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              defaultValue={getDefaultNumber(pricing?.other_cost)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="risk-allowance-percent">Risk allowance %</Label>
          <Input
            id="risk-allowance-percent"
            name="riskAllowancePercent"
            type="number"
            min="0"
            max="99"
            step="0.01"
            inputMode="decimal"
            defaultValue={getDefaultNumber(pricing?.risk_allowance_percent)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target-margin-percent">Profit target %</Label>
          <Input
            id="target-margin-percent"
            name="targetMarginPercent"
            type="number"
            min="0"
            max="99"
            step="0.01"
            inputMode="decimal"
            defaultValue={getDefaultNumber(pricing?.target_margin_percent, 30)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assumptions">Assumptions</Label>
        <textarea
          id="assumptions"
          name="assumptions"
          defaultValue={pricing?.assumptions ?? ""}
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exclusions">Exclusions</Label>
        <textarea
          id="exclusions"
          name="exclusions"
          defaultValue={pricing?.exclusions ?? ""}
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="proposal-notes">Notes for Proposal Builder</Label>
        <textarea
          id="proposal-notes"
          name="proposalNotes"
          defaultValue={pricing?.proposal_notes ?? ""}
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <Button type="submit">{pricing ? "Update pricing" : "Save pricing"}</Button>
    </form>
  );
}
