"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

import { OfflineOrdersList } from "./offline-orders-list";

export function Orders() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("pos");

  // Get tab from URL path
  useEffect(() => {
    const normalizedPath =
      pathname.endsWith("/") && pathname !== "/"
        ? pathname.slice(0, -1)
        : pathname;

    if (normalizedPath === "/dashboard/orders") {
      // Redirect to online orders tab by default
      router.replace("/dashboard/orders/pos");
    } else {
      const pathSegments = normalizedPath.split("/");
      const lastSegment = pathSegments[pathSegments.length - 1];
      setActiveTab(lastSegment || "pos");
    }
  }, [pathname, router]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/dashboard/orders/${value}`);
  };

  return (
    <div className="w-full p-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Header with Tabs */}
        <div className="mb-6 flex items-center gap-5">
          <TabsList className="w-auto">
        
            <TabsTrigger value="pos">POS Orders</TabsTrigger>
          </TabsList>
        </div>

       
        <TabsContent value="pos" className="mt-0 w-full">
          <OfflineOrdersList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
