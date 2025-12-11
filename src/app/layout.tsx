import type { Metadata } from "next";
import "../app/globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { AppLoadingProvider } from "@/providers/AppLoadingProvider";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: "Aloqa AI - Client Calling Portal",
  description: "Client calling portal for real estate lead management and AI-powered phone calls",
  keywords: ["AI", "calling", "real estate", "leads", "management", "automation"],
  authors: [{ name: "Aloqa AI Team" }],
  robots: "index, follow",
  openGraph: {
    title: "Aloqa AI - Client Calling Portal",
    description: "AI-powered client calling portal for real estate professionals",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aloqa AI - Client Calling Portal",
    description: "AI-powered client calling portal for real estate professionals",
  },
  icons: {
    icon: [
      {
        url: "/inner-logo.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/inner-logo.svg",
    apple: [
      {
        url: "/inner-logo.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AppLoadingProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </AuthProvider>
        </AppLoadingProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
