"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  Receipt,
  Store,
  Globe,
  ChevronLeft,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LogoutAlert } from "@/components/ui/logout-alert";
import { useAuth } from "@/hooks/useAuth";

import { TbReceipt } from "react-icons/tb";
import {
  getWebSettings,
  type WebSettings,
} from "@/services/online-services/webSettingsService";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

// Define the type for navigation items
type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

// Navigation data
const navMain: NavItem[] = [

  {
    title: "Dashboard",
    url: "/dashboard",
    icon: TrendingUp,
    isActive: true,
  },
  
  {

    title: "Inventory",
    url: "/dashboard/inventory-management",
    icon: Package,
    isActive: true,
    items: [
      {
        title: "Warehouse",
        url: "/dashboard/inventory-management/warehouse",
      },
      {
        title: "Stock Adjustment",
        url: "/dashboard/inventory-management/stock-adjustment",
      },
      {
        title: "Reports",
        url: "/dashboard/inventory-management/reports",
      },
    ],
  },
 
  {
    title: "POS",
    url: "/dashboard/pos",
    icon: TbReceipt,
    isActive: true,
    items: [
      {
        title: "Products",
        url: "/dashboard/pos/products",
      },
    ],
  },
 
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingCart,
    isActive: true,
    items: [
      
      {
        title: "Pos Orders",
        url: "/dashboard/orders/pos",
      },
    ],
  },
  {
    title: "Finances",
    url: "/dashboard/finances",
    icon: DollarSign,
    isActive: true,
    items: [
      {
        title: "Sales",
        url: "/dashboard/finances/sales",
      },
      {
        title: "Transactions",
        url: "/dashboard/finances/transactions",
      },
    ],
  },
 
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { user, logout } = useAuth(false);
  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);
  const [logoutTimeoutId, setLogoutTimeoutId] =
    React.useState<NodeJS.Timeout | null>(null);
  const [webSettings, setWebSettings] = React.useState<WebSettings | null>(
    null
  );
  const [isLoadingLogo, setIsLoadingLogo] = React.useState(true);

  // Fetch web settings on mount
  React.useEffect(() => {
    const fetchWebSettings = async () => {
      try {
        setIsLoadingLogo(true);
        const response = await getWebSettings();
        if (response.success) {
          setWebSettings(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch web settings:", error);
      } finally {
        setIsLoadingLogo(false);
      }
    };

    fetchWebSettings();
  }, []);

  const handleLogoutClick = () => {
    // Clear any existing timeout
    if (logoutTimeoutId) {
      clearTimeout(logoutTimeoutId);
      setLogoutTimeoutId(null);
    }
    setShowLogoutAlert(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      // Add 1 second delay before closing alert and redirecting
      const timeoutId = setTimeout(() => {
        setShowLogoutAlert(false);
        setLogoutTimeoutId(null);
      }, 1000);
      setLogoutTimeoutId(timeoutId);
    } catch (error) {
      console.error("Logout failed:", error);
      // Keep the alert open on error
    }
  };

  const handleModalChange = (open: boolean) => {
    if (!open) {
      // Clear any pending timeout when modal is closed
      if (logoutTimeoutId) {
        clearTimeout(logoutTimeoutId);
        setLogoutTimeoutId(null);
      }
    }
    setShowLogoutAlert(open);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (logoutTimeoutId) {
        clearTimeout(logoutTimeoutId);
      }
    };
  }, [logoutTimeoutId]);


  // Helper function to check if a path is active
  const isActive = (url: string): boolean => {
    if (url === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(url);
  };

  // Helper function to check if settings section is active
  const isSettingsActive = () => {
    return pathname.startsWith("/dashboard/settings");
  };



  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center py-4 px-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center w-16 h-16">
          {isLoadingLogo ? (
            <Store className="size-8 text-slate-700 dark:text-slate-300" />
          ) : webSettings?.logoUrl ? (
            <Image
              src={webSettings.logoUrl}
              alt="Store Logo"
              width={64}
              height={64}
              className="object-contain w-full h-full"
              priority
            />
          ) : (
            <Store className="size-8 text-slate-700 dark:text-slate-300" />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white dark:bg-slate-950">
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu className="gap-1">
            {navMain.map((item) => {
              if (item.items && item.items.length > 0) {
                return (
                  <Collapsible
                    key={item.title}
                    defaultOpen={isActive(item.url)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <div className="flex items-center justify-between w-full">
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={isActive(item.url)}
                          className={`flex-1 rounded-lg transition-all duration-200 ${
                            isActive(item.url)
                              ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-400 shadow-sm"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Link href={item.url}>
                            {item.icon && <item.icon className="h-5 w-5" />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        <CollapsibleTrigger asChild>
                          <button
                            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0 mr-1"
                            aria-label={`Toggle ${item.title}`}
                          >
                            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(subItem.url)}
                                className={`rounded-lg transition-all duration-200 ${
                                  isActive(subItem.url)
                                    ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                    className={`rounded-lg transition-all duration-200 ${
                      isActive(item.url)
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-400 shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Link href={item.url}>
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-gradient-to-t from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800">
        <SidebarMenu>
          {/* Settings Dropdown */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip="Settings"
                  isActive={isSettingsActive()}
                  className={`rounded-lg transition-all duration-200 ${
                    isSettingsActive()
                      ? "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 text-purple-700 dark:text-purple-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-semibold">Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/dashboard/settings/logo">
                      <Globe className="mr-2 h-4 w-4" />
                      <span>Logo</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/dashboard/settings/invoice">
                      <Receipt className="mr-2 h-4 w-4" />
                      <span>Invoice</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/dashboard/settings/gst">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span>Gst / Tax</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          {/* User Profile Dropdown */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="rounded-lg transition-all duration-200 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-slate-900 dark:text-white">
                      {user?.name || "Admin"}
                    </span>
                    <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.email || ""}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.image} alt={user?.name} />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.name || "Admin"}
                      </span>
                      <span className="truncate text-xs">
                        {user?.email || ""}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 dark:text-red-500 focus:text-red-700 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={handleLogoutClick}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />

      {/* Logout Confirmation Alert */}
      <LogoutAlert
        open={showLogoutAlert}
        onOpenChange={handleModalChange}
        onConfirm={handleLogoutConfirm}
        userName={user?.name}
      />
    </Sidebar>
  );
}
