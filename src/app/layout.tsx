import type { Metadata } from "next";

import { AppNavigation } from "@/components/app-navigation";

import "./globals.css";

export const metadata: Metadata = {
  title: "Job Hub Pro",
  description: "A simple operating system for UK trades businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>
        <AppNavigation />
        {children}
      </body>
    </html>
  );
}
