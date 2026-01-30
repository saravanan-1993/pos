import { DashboardLayout } from "@/components/Layouts/dashboardlayout";


export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   
      <DashboardLayout>{children}</DashboardLayout>
    
  );
}