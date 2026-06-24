import Link from "next/link";
import { ArrowRight, ClipboardCheck, HardHat, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-5 py-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Job Hub Pro
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
              A mobile-first job operating system for UK trades businesses.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Manage the essentials around customers, properties, jobs, teams,
              sign-offs and payments from one practical workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-md border p-4">
                <ClipboardCheck className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h2 className="font-medium">Job flow</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    From enquiry to completion, sign-off and payment tracking.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-md border p-4">
                <HardHat className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h2 className="font-medium">Built for the field</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Simple screens that work well on a phone for office and site teams.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-md border p-4">
                <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
                <div>
                  <h2 className="font-medium">Secure foundation</h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Supabase authentication, tenant boundaries and audit history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

