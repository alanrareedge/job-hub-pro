import Link from "next/link";

import { createJob } from "@/app/customers/[customerId]/properties/[propertyId]/jobs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type JobFormProps = {
  customerId: string;
  propertyId: string;
  errorMessage?: string | null;
};

export function JobForm({ customerId, propertyId, errorMessage }: JobFormProps) {
  const action = createJob.bind(null, customerId, propertyId);

  return (
    <form action={action} className="space-y-5">
      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reference">Reference</Label>
          <Input id="reference" name="reference" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target-date">Target date</Label>
          <Input id="target-date" name="targetDate" type="date" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <select
          id="priority"
          name="priority"
          defaultValue="normal"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit">Create job</Button>
        <Button asChild type="button" variant="outline">
          <Link href={`/customers/${customerId}/properties/${propertyId}/jobs`}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
