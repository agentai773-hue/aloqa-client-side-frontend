import type { Metadata } from "next";
import { Header, Sidebar } from "@/components/layout";

export const metadata: Metadata = {
  title: "Dashboard - Aloqa AI",
  description: "Client calling dashboard",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <style>{`
        :root {
          --sidebar-width: 256px;
        }
        
        @media (max-width: 1023px) {
          :root {
            --sidebar-width: 0px;
          }
        }
        
        /* Hide scrollbar while keeping scrolling functional */
        html, body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="min-h-screen flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 transition-all duration-300 ease-out" style={{ marginLeft: 'var(--sidebar-width)' }}>
          {/* Header */}
          <Header />

          {/* Page content */}
          <main className="p-6 bg-gray-50 min-h-[calc(100vh-73px)]">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
