import { ClipboardList, CreditCard, History, Wrench } from "lucide-react";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const placeholderCards = [
  {
    title: "Today's jobs",
    description: "Scheduled work will appear here in a later phase.",
    icon: ClipboardList,
  },
  {
    title: "Jobs needing attention",
    description: "Exceptions and follow-ups will be tracked here.",
    icon: Wrench,
  },
  {
    title: "Outstanding payments",
    description: "Payment tracking starts after the job workflow is built.",
    icon: CreditCard,
  },
  {
    title: "Recent activity",
    description: "Audit log activity will surface here as the app grows.",
    icon: History,
  },
];

type CurrentAppUser = {
  id: string;
  business_id: string;
  name: string | null;
  role: "owner" | "office" | "operative";
  status: "active" | "invited" | "disabled";
};

type CurrentBusiness = {
  id: string;
  name: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const { data: appUserData } = await supabase
    .from("users")
    .select("id, business_id, name, role, status")
    .eq("auth_user_id", authUser.id)
    .eq("status", "active")
    .is("archived_at", null)
    .single();
  const appUser = appUserData as CurrentAppUser | null;

  if (!appUser) {
    await supabase.auth.signOut();
    redirect("/login?error=workspace-not-found");
  }

  const { data: businessData } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("id", appUser.business_id)
    .is("archived_at", null)
    .single();
  const business = businessData as CurrentBusiness | null;

  if (!business) {
    await supabase.auth.signOut();
    redirect("/login?error=workspace-not-found");
  }

  return (
    <main className="min-h-screen bg-muted px-5 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {business.name}
          </h1>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6">
            <span>User: {appUser.name ?? authUser.email}</span>
            <span>Role: {appUser.role}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {placeholderCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.title}>
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    Placeholder
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
