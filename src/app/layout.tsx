import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { ModalProvider } from "@/context/ModalContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AppShell } from "@/components/AppShell";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Collision Week | Penyeimbang Beban Tugas & Bantuan Sebaya",
  description:
    "Penyeimbang beban tugas akademik dan bantuan sebaya berbasis sub-topik untuk program studi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${plusJakartaSans.variable} antialiased bg-cw-bg text-cw-ink font-sans`}>
        <RoleProvider>
          <ModalProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </ModalProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
