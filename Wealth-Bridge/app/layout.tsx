import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "WealthBridge - Your Path to Financial Freedom",
  description: "Gamified financial education platform for building credit, learning investing, and connecting with mentors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="beforeInteractive"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ClientLayout>
            <Navbar />
            <main className="relative z-10">
              {children}
            </main>
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
