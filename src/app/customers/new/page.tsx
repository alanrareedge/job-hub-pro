import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomerForm } from "@/features/customers/customer-form";
import { createClient } from "@/lib/supabase/server";

type NewCustomerPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-fields":
      return "First name and last name are required.";
    case "create-failed":
      return "We could not create the customer. Please try again.";
    default:
      return null;
  }
}

export default async function NewCustomerPage({ searchParams }: NewCustomerPageProps) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const params = await searchParams;

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link className="text-sm font-medium text-primary" href="/customers">
          Back to customers
        </Link>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Add customer</CardTitle>
            <CardDescription>Create a customer for this business workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerForm errorMessage={getErrorMessage(params?.error)} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

