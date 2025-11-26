import type { Metadata } from "next";
import "../app/globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Aloqa AI - Client Calling Portal",
  description: "Client calling portal for real estate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
