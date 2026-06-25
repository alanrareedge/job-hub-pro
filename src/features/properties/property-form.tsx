import Link from "next/link";

import { createProperty } from "@/app/customers/[customerId]/properties/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PropertyFormProps = {
  customerId: string;
  errorMessage?: string | null;
};

export function PropertyForm({ customerId, errorMessage }: PropertyFormProps) {
  const action = createProperty.bind(null, customerId);

  return (
    <form action={action} className="space-y-5">
      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="property-name">Property name</Label>
        <Input id="property-name" name="propertyName" autoComplete="off" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address-line-1">Address line 1</Label>
        <Input
          id="address-line-1"
          name="addressLine1"
          autoComplete="address-line1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address-line-2">Address line 2</Label>
        <Input id="address-line-2" name="addressLine2" autoComplete="address-line2" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="town">Town</Label>
          <Input id="town" name="town" autoComplete="address-level2" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="county">County</Label>
          <Input id="county" name="county" autoComplete="address-level1" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="postcode">Postcode</Label>
        <Input id="postcode" name="postcode" autoComplete="postal-code" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="access-notes">Access notes</Label>
        <textarea
          id="access-notes"
          name="accessNotes"
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit">Create property</Button>
        <Button asChild type="button" variant="outline">
          <Link href={`/customers/${customerId}/properties`}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
