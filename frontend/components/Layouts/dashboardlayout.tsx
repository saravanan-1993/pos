"use client";


import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Dashboard/sidebar/app-sidebar";
import { DashboardNavbar } from "@/components/Dashboard/sidebarNavbar/dashboard-navbar";
import { ErrorBoundary } from "@/components/ui/error-boundary";


interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardNavbar />

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
