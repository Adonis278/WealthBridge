import type { Metadata, Viewport } from "next";
import { Manrope, Fraunces } from "next/font/google";
import "./globals.css";

// Self-hosted and preloaded at build time: no request to fonts.googleapis.com,
// no render-blocking @import chain, and no flash of fallback text.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "WealthBridge - Your Path to Financial Freedom",
  description: "Gamified financial education platform for building credit, learning investing, and connecting with mentors.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${fraunces.variable}`}
    >
      <body suppressHydrationWarning className="overflow-x-hidden">
        <AuthProvider>
          <ClientLayout>
            <Navbar />
            {/* The header is fixed and out of flow, so reserve its height here.
                Pages that want artwork running underneath it (the home hero)
                cancel this with a matching negative top margin. */}
            <main className="relative z-10 pt-[88px]">
              {children}
            </main>
            <Footer />
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
