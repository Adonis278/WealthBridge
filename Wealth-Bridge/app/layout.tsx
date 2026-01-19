import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FallingLeaves from "@/components/FallingLeaves";
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
      <body>
        <AuthProvider>
          <ClientLayout>
            <FallingLeaves />
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
