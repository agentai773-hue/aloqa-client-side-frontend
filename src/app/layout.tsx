import type { Metadata } from "next";
import "../app/globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { AppLoadingProvider } from "@/providers/AppLoadingProvider";

export const metadata: Metadata = {
  title: "Aloqa AI - Client Calling Portal",
  description: "Client calling portal",
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
      </body>
    </html>
  );
}
