import type { Metadata } from "next";
import { Header, Sidebar } from "@/components/layout";

export const metadata: Metadata = {
  title: "Dashboard - Real Estate CRM",
  description: "Client calling dashboard",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="p-6 bg-gray-50 min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
