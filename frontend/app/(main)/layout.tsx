import { AppLayout } from "@/components/Layouts/applayout";
import { Toaster } from "@/components/ui/sonner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppLayout>
        <Toaster 
          position="top-center"
          toastOptions={{
            className: "border-2 border-border shadow-xl rounded-lg text-lg",
            duration: 4000,
            style: {
              background: "var(--background)",
              color: "var(--foreground)",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
              padding: "20px 24px",
              minWidth: "400px",
              maxWidth: "600px",
            },
          }}
          richColors
          expand
          gap={12}
        />
        {children}
      </AppLayout>
    </>
  )
}
