import { updateBusinessDetails } from "@/app/settings/business/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BusinessDetails = {
  name: string;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  town: string | null;
  postcode: string | null;
};

type BusinessDetailsFormProps = {
  business: BusinessDetails;
  canEdit: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
};

export function BusinessDetailsForm({
  business,
  canEdit,
  errorMessage,
  successMessage,
}: BusinessDetailsFormProps) {
  return (
    <form action={updateBusinessDetails} className="space-y-5">
      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {!canEdit ? (
        <div className="rounded-md border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Only owners can update business details.
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="business-name">Business name</Label>
        <Input
          id="business-name"
          name="name"
          defaultValue={business.name}
          disabled={!canEdit}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={business.email ?? ""}
            disabled={!canEdit}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={business.phone ?? ""}
            disabled={!canEdit}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address-line-1">Address line 1</Label>
        <Input
          id="address-line-1"
          name="addressLine1"
          autoComplete="address-line1"
          defaultValue={business.address_line_1 ?? ""}
          disabled={!canEdit}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address-line-2">Address line 2</Label>
        <Input
          id="address-line-2"
          name="addressLine2"
          autoComplete="address-line2"
          defaultValue={business.address_line_2 ?? ""}
          disabled={!canEdit}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="town">Town</Label>
          <Input
            id="town"
            name="town"
            autoComplete="address-level2"
            defaultValue={business.town ?? ""}
            disabled={!canEdit}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postcode">Postcode</Label>
          <Input
            id="postcode"
            name="postcode"
            autoComplete="postal-code"
            defaultValue={business.postcode ?? ""}
            disabled={!canEdit}
          />
        </div>
      </div>

      {canEdit ? <Button type="submit">Save business details</Button> : null}
    </form>
  );
}
