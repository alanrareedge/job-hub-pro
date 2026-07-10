import Link from "next/link";
import {
  BadgePoundSterling,
  BellRing,
  Building2,
  CreditCard,
  FileText,
  Palette,
  Phone,
  Shield,
  Tags,
  Users,
  Wrench,
} from "lucide-react";
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

type CurrentBusiness = {
  id: string;
  name: string;
};

const futureSettings = [
  {
    title: "Branding",
    description: "Logo, colours and customer-facing style will live here later.",
    icon: Palette,
  },
  {
    title: "Labour rates",
    description: "Reusable labour rates will be configured in a future phase.",
    icon: BadgePoundSterling,
  },
  {
    title: "Standard price lists",
    description: "Repeatable pricing shortcuts will be managed here later.",
    icon: Tags,
  },
  {
    title: "Proposal defaults",
    description: "Default proposal wording and rules will be added later.",
    icon: FileText,
  },
  {
    title: "Trade profiles",
    description: "Trade-specific shortcuts will be configured in a future phase.",
    icon: Wrench,
  },
  {
    title: "Team",
    description: "Team management will be added in a later phase.",
    icon: Users,
  },
  {
    title: "Communication settings",
    description: "GHL and communication preferences will live here later.",
    icon: BellRing,
  },
  {
    title: "Phone settings",
    description: "Phone setup will be handled when communications are integrated.",
    icon: Phone,
  },
  {
    title: "Billing",
    description: "Billing and subscriptions will be added later.",
    icon: CreditCard,
  },
  {
    title: "Permissions",
    description: "Permission controls will be introduced when roles expand.",
    icon: Shield,
  },
];

export default async function SettingsPage() {
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
        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground">{business.name}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Settings</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">Business Profile</CardTitle>
              <CardDescription>
                View and update the core identity for this business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/settings/business">Open</Link>
              </Button>
            </CardContent>
          </Card>

          {futureSettings.map((setting) => {
            const Icon = setting.icon;

            return (
              <Card key={setting.title}>
                <CardHeader>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{setting.title}</CardTitle>
                  <CardDescription>{setting.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    Future setting
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
