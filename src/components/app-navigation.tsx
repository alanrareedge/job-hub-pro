"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const publicRoutes = ["/", "/login", "/signup"];

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    isActive: (pathname: string) => pathname === "/dashboard",
  },
  {
    label: "Customers",
    href: "/customers",
    isActive: (pathname: string) => pathname.startsWith("/customers"),
  },
  {
    label: "Settings",
    href: "/settings",
    isActive: (pathname: string) => pathname.startsWith("/settings"),
  },
];

export function AppNavigation() {
  const pathname = usePathname();

  if (publicRoutes.includes(pathname)) {
    return null;
  }

  return (
    <header className="border-b bg-background px-5 py-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link className="text-base font-semibold tracking-normal text-foreground" href="/dashboard">
          Job Hub Pro
        </Link>

        <nav aria-label="Main navigation" className="grid grid-cols-3 gap-2 sm:flex sm:gap-2">
          {navItems.map((item) => {
            const active = item.isActive(pathname);

            return (
              <Link
                className={cn(
                  "rounded-md px-3 py-2 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
