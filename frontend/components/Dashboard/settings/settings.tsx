"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceSettings } from "./invoice/invoice-settings";
import { GSTSettings } from "./gst/gst-settings";
import { LogoSettings } from "./logo/logo-settings";
import { CompanyInformation } from "./company/company-information";

import { useEffect, useState } from "react";

export const Settings = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("company");

  // Get tab from URL path
  useEffect(() => {
    const normalizedPath =
      pathname.endsWith("/") && pathname !== "/"
        ? pathname.slice(0, -1)
        : pathname;

    if (normalizedPath === "/dashboard/settings") {
      // Redirect to company tab by default
      router.replace("/dashboard/settings/company");
    } else {
      const pathSegments = normalizedPath.split("/");
      const lastSegment = pathSegments[pathSegments.length - 1];
      setActiveTab(lastSegment || "company");
    }
  }, [pathname, router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/dashboard/settings/${value}`);
  };

  return (
    <div className="w-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and configurations
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full max-w-4xl grid grid-cols-4">
          <TabsTrigger value="company">
            Company
          </TabsTrigger>
          <TabsTrigger value="logo">
            Logo
          </TabsTrigger>
          <TabsTrigger value="invoice">
            Invoice
          </TabsTrigger>
          <TabsTrigger value="gst">
            GST
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6 w-full">
          <CompanyInformation />
        </TabsContent>

        <TabsContent value="logo" className="mt-6 w-full">
          <LogoSettings />
        </TabsContent>
      
        <TabsContent value="invoice" className="mt-6 w-full">
          <InvoiceSettings />
        </TabsContent>

        <TabsContent value="gst" className="mt-6 w-full">
          <GSTSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
