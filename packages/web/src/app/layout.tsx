import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../branding/fonts.css";
import "../theme/theme.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { BuilderProvider } from "@/components/builder/BuilderProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyHealthAlly Clinic Dashboard",
  description: "Continuous care management dashboard",
};

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <BuilderProvider>
          <AuthProvider>{children}</AuthProvider>
        </BuilderProvider>
      </body>
    </html>
  );
}

