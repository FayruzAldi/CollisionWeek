import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { ModalProvider } from "@/context/ModalContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AppShell } from "@/components/AppShell";
import { PWARegister } from "@/components/PWARegister";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Collision Week | Penyeimbang Beban Tugas & Bantuan Sebaya",
  description:
    "Penyeimbang beban tugas akademik dan bantuan sebaya berbasis sub-topik untuk program studi.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Collision Week",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Collision Week",
    description: "Penyeimbang beban tugas akademik & bantuan sebaya sub-topik",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#5850EC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${plusJakartaSans.variable} antialiased bg-cw-bg text-cw-ink font-sans`}>
        <PWARegister />
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
