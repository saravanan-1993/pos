import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";

import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "ECommerce App",
  description: "Modern ecommerce application with authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
     
        {children}

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
      </body>
    </html>
  );
}
