import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
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

type CustomerListItem = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

type CustomersPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "owner-required") {
    return "Only owners can create customers at this stage.";
  }

  return null;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
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

  const { data: customerData } = await supabase
    .from("customers")
    .select("id, first_name, last_name, email, phone, created_at")
    .eq("business_id", appUser.business_id)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  const customers = (customerData ?? []) as CustomerListItem[];
  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Job Hub Pro</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">Customers</h1>
          </div>
          <Button asChild>
            <Link href="/customers/new">Add customer</Link>
          </Button>
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {customers.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No customers yet</CardTitle>
              <CardDescription>
                Add your first customer to start building the business workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/customers/new">Add customer</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {customers.map((customer) => (
              <Card key={customer.id}>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {customer.first_name} {customer.last_name}
                  </CardTitle>
                  <CardDescription>
                    Added {new Date(customer.created_at).toLocaleDateString("en-GB")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <span>Email: {customer.email || "Not provided"}</span>
                    <span>Phone: {customer.phone || "Not provided"}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

