"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Route mapping for breadcrumbs
const routeMap: Record<string, { title: string; parent?: string }> = {
  // Dashboard
  "/dashboard": { title: "Dashboard" },

  
  // Inventory Management
  "/dashboard/inventory-management": {
    title: "Inventory",
    parent: "/dashboard",
  },
  "/dashboard/inventory-management/warehouse": {
    title: "Warehouse",
    parent: "/dashboard/inventory-management",
  },
  "/dashboard/inventory-management/stock-adjustment": {
    title: "Stock Adjustment",
    parent: "/dashboard/inventory-management",
  },
  "/dashboard/inventory-management/stock-adjustment/adjustment": {
    title: "Adjustment",
    parent: "/dashboard/inventory-management/stock-adjustment",
  },
  "/dashboard/inventory-management/reports": {
    title: "Reports",
    parent: "/dashboard/inventory-management",
  },

  // POS
  "/dashboard/pos": { title: "POS", parent: "/dashboard" },
  "/dashboard/pos/products": { title: "Products", parent: "/dashboard/pos" },
  "/dashboard/pos/products/edit": {
    title: "Edit Product",
    parent: "/dashboard/pos/products",
  },

  // Customer Management
  "/dashboard/customer-management": {
    title: "Customers",
    parent: "/dashboard",
  },
  "/dashboard/customer-management/view": {
    title: "View Customer",
    parent: "/dashboard/customer-management",
  },

  // Orders
  "/dashboard/orders": { title: "Orders", parent: "/dashboard" },
  "/dashboard/orders/online": {
    title: "Online Orders",
    parent: "/dashboard/orders",
  },
  "/dashboard/orders/pos": { 
    title: "POS Orders", 
    parent: "/dashboard/orders" 
  },

  // Finances
  "/dashboard/finances": { title: "Finances", parent: "/dashboard" },
  "/dashboard/finances/sales": {
    title: "Sales",
    parent: "/dashboard/finances",
  },
  "/dashboard/finances/sales/online-sales": {
    title: "Online Sales",
    parent: "/dashboard/finances/sales",
  },
  "/dashboard/finances/sales/pos-sales": {
    title: "POS Sales",
    parent: "/dashboard/finances/sales",
  },
  "/dashboard/finances/sales/reports": {
    title: "Reports",
    parent: "/dashboard/finances/sales",
  },
  "/dashboard/finances/transactions": {
    title: "Transactions",
    parent: "/dashboard/finances",
  },

  

  // Settings
  "/dashboard/settings": { title: "Settings", parent: "/dashboard" },
  
  "/dashboard/settings/invoice": {
    title: "Invoice",
    parent: "/dashboard/settings",
  },
  "/dashboard/settings/gst": {
    title: "GST / Tax",
    parent: "/dashboard/settings",
  },
};

// User data will be loaded from localStorage

function generateBreadcrumbs(pathname: string) {
  const pathSegments = pathname.split("/").filter(Boolean);
  const pathChain = [];

  // Always start with Dashboard if we're in a sub-route
  if (pathSegments.length > 0 && pathSegments[0] !== "dashboard") {
    pathChain.push({
      title: "Dashboard",
      href: "/dashboard",
      isLast: false,
    });
  }

  // Build breadcrumb chain
  let processedPath = "";
  for (const segment of pathSegments) {
    processedPath += `/${segment}`;

    if (routeMap[processedPath]) {
      const route = routeMap[processedPath];
      pathChain.push({
        title: route.title,
        href: processedPath,
        isLast: processedPath === pathname,
      });
    }
  }

  return pathChain;
}

export function DashboardNavbar() {
  const pathname = usePathname();
  
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center bg-gradient-to-r from-white via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/50 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border-b border-slate-200/60 dark:border-slate-800/60 relative overflow-hidden backdrop-blur-xl">
      {/* Premium Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Gradient overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-indigo-50/20 dark:from-blue-950/15 dark:via-transparent dark:to-indigo-950/10"></div>
        
        {/* Animated floating elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-bl from-blue-200/40 via-blue-100/20 to-transparent dark:from-blue-900/30 dark:via-blue-800/10 dark:to-transparent blur-3xl opacity-30 dark:opacity-20 animate-pulse" style={{ animationDuration: "4s" }}></div>
        <div className="absolute -bottom-12 -left-32 w-80 h-80 bg-gradient-to-tr from-indigo-200/30 via-transparent to-blue-100/20 dark:from-indigo-900/20 dark:via-transparent dark:to-blue-900/10 blur-3xl opacity-20 dark:opacity-10"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,rgba(71,85,105,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(71,85,105,0.05)_1px,transparent_1px)] opacity-50 dark:opacity-30"></div>
      </div>

      <div className="flex items-center gap-3 px-6 flex-1 relative z-10">
        {/* Sidebar Trigger */}
        <SidebarTrigger className="group -ml-2 h-10 w-10 p-2 rounded-lg hover:bg-gradient-to-br hover:from-blue-100 hover:to-blue-50 dark:hover:from-slate-800 dark:hover:to-slate-900 text-slate-700 dark:text-slate-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-200/30 dark:hover:shadow-blue-900/20 relative overflow-hidden" />

        <Separator orientation="vertical" className="h-6 bg-gradient-to-b from-slate-200/50 via-slate-200 to-slate-200/50 dark:from-slate-700/30 dark:via-slate-700/50 dark:to-slate-700/30" />

        {/* Advanced Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList className="gap-1.5">
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={`breadcrumb-${index}-${breadcrumb.href}`} className="flex items-center gap-1.5">
                {index > 0 && (
                  <BreadcrumbSeparator className="text-slate-300 dark:text-slate-600 opacity-50 mx-1">/</BreadcrumbSeparator>
                )}
                <BreadcrumbItem>
                  {breadcrumb.isLast ? (
                    <BreadcrumbPage className="font-semibold text-slate-900 dark:text-white bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50 dark:from-blue-950/40 dark:via-blue-950/50 dark:to-indigo-950/40 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl shadow-md shadow-blue-200/30 dark:shadow-blue-900/20 hover:shadow-lg hover:shadow-blue-300/40 dark:hover:shadow-blue-800/30 transition-all duration-300 border border-blue-200/60 dark:border-blue-800/40 backdrop-blur-md hover:border-blue-300/80 dark:hover:border-blue-700/60 group relative overflow-hidden">
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-full group-hover:translate-x-0" style={{ animation: "shimmer 2s infinite" }}></div>
                      <span className="relative">{breadcrumb.title}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={breadcrumb.href}
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gradient-to-r hover:from-slate-100/50 hover:to-slate-50/50 dark:hover:from-slate-800/40 dark:hover:to-slate-900/40 px-3 py-1.5 rounded-lg transition-all duration-300 font-medium text-sm group relative"
                      >
                        <span className="relative z-10">{breadcrumb.title}</span>
                        
                        {/* Bottom gradient line */}
                        <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full group-hover:shadow-md group-hover:shadow-blue-400/50"></span>
                        
                        {/* Hover background effect */}
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-400/5 group-hover:to-indigo-400/5 dark:group-hover:from-blue-400/10 dark:group-hover:to-indigo-400/5 rounded-lg transition-all duration-300 -z-10"></span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right side action area */}
      <div className="flex items-center gap-4 px-6 relative z-10">
        {/* Decorative element */}
        <div className="hidden sm:block w-1 h-8 bg-gradient-to-b from-blue-400/30 via-blue-500/30 to-indigo-400/30 dark:from-blue-600/20 dark:via-blue-500/20 dark:to-indigo-600/20 rounded-full"></div>
      </div>
    </header>
  );
}
