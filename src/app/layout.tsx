import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { ModalProvider } from "@/context/ModalContext";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Collision Week | Academic Load Balancing & Sub-topic Peer Help",
  description:
    "Deterministic academic load balancing and sub-topic peer assistance for university programs. Built for GDGoC ITB STACK 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8F9FB] text-slate-900">
        <RoleProvider>
          <ModalProvider>
            <AppShell>{children}</AppShell>
          </ModalProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
