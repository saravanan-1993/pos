"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AlertCircle, Package, Search, Loader2, ImageIcon } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import Image from "next/image";

interface Item {
  id: string;
  itemName: string;
  category: string;
  itemCode: string | null;
  uom: string;
  purchasePrice: number;
  gstPercentage: number;
  hsnCode: string | null;
  openingStock: number;
  quantity: number;
  lowStockAlertLevel: number;
  status: string;
  expiryDate: string | null;
  description: string | null;
  itemImage: string | null;
  createdAt: string;
  updatedAt: string;
  warehouseId: string;
}

interface WarehouseViewListItemsProps {
  warehouseId: string;
}

export default function WarehouseViewListItems({
  warehouseId,
}: WarehouseViewListItemsProps) {
  // Data state
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  

  // Fetch items for this warehouse
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/api/inventory/items?warehouse=${warehouseId}`
      );
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to fetch items");
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    return [...new Set(items.map((item) => item.category))];
  }, [items]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Determine stock status
      const stockStatus =
        item.quantity === 0
          ? "out of stock"
          : item.quantity <= item.lowStockAlertLevel
          ? "low stock"
          : "in stock";

      // Search filter - includes name, SKU, category, HSN code, and stock status
      const matchesSearch =
        searchTerm === "" ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.itemCode &&
          item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.hsnCode &&
          item.hsnCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        stockStatus.includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category filter
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      // Stock filter
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "out" && item.quantity === 0) ||
        (stockFilter === "low" &&
          item.quantity > 0 &&
          item.quantity <= item.lowStockAlertLevel) ||
        (stockFilter === "in-stock" && item.quantity > item.lowStockAlertLevel);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [items, searchTerm, categoryFilter, stockFilter]);

  // Calculate stats
  const inStockCount = filteredItems.filter(
    (item) => item.quantity > item.lowStockAlertLevel
  ).length;
  const lowStockCount = filteredItems.filter(
    (item) => item.quantity > 0 && item.quantity <= item.lowStockAlertLevel
  ).length;
  const outOfStockCount = filteredItems.filter(
    (item) => item.quantity === 0
  ).length;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, stockFilter, itemsPerPage]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis-start");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-end");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStockFilter("all");
  };

  // Calculate total inventory value
  const totalInventoryValue = useMemo(() => {
    return filteredItems.reduce((sum, item) => {
      const priceWithGst =
        item.purchasePrice + (item.purchasePrice * item.gstPercentage) / 100;
      return sum + priceWithGst * item.quantity;
    }, 0);
  }, [filteredItems]);

  const totalItems = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [filteredItems]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-muted-foreground">Loading items...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
            Total Items
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {filteredItems.length}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {totalItems} units in stock
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="text-sm text-green-600 dark:text-green-400 mb-1">
            In Stock
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {inStockCount}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            {((inStockCount / filteredItems.length) * 100 || 0).toFixed(1)}% of
            items
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">
            Low Stock
          </div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            {lowStockCount}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            Needs attention
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
            Total Value
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            ₹
            {totalInventoryValue.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            Including GST
          </div>
        </div>
      </div>

      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="size-5" />
          <h2 className="text-lg font-semibold">Inventory Items</h2>
          <Badge variant="secondary">{filteredItems.length} Items</Badge>
        </div>
        {outOfStockCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="size-4 text-red-600" />
            <span className="text-red-600 font-semibold">
              {outOfStockCount} item{outOfStockCount > 1 ? "s" : ""} out of
              stock
            </span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, category, HSN code, stock status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stock Level Filter */}
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Stock Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {(searchTerm ||
            categoryFilter !== "all" ||
            stockFilter !== "all") && (
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead className="text-right">Purchase Price</TableHead>
              <TableHead className="text-center">GST %</TableHead>
              <TableHead className="text-right">Price + GST</TableHead>
              <TableHead>HSN Code</TableHead>
              <TableHead className="text-right">Opening Stock</TableHead>
              <TableHead className="text-right">Current Qty</TableHead>
              <TableHead className="text-right">Low Stock Alert</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm ||
                    categoryFilter !== "all" ||
                    stockFilter !== "all"
                      ? "No items found matching your filters."
                      : "No inventory items found in this warehouse"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((item) => {
                const priceWithGst =
                  item.purchasePrice +
                  (item.purchasePrice * item.gstPercentage) / 100;
                const formatPrice = (price: number) => {
                  return price % 1 === 0 ? price.toString() : price.toFixed(2);
                };
                const formatGst = (gst: number) => {
                  return gst % 1 === 0 ? gst.toString() : gst.toFixed(2);
                };
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="w-12 h-12 relative bg-muted rounded-md overflow-hidden flex items-center justify-center">
                        {item.itemImage ? (
                          <Image
                            src={item.itemImage}
                            alt={item.itemName}
                            fill
                            className="object-cover"
                            sizes="48px"
                            onError={(e) => {
                              console.error(
                                "Failed to load image for item:",
                                item.itemName,
                                "URL:",
                                item.itemImage
                              );
                              // Hide the broken image and show fallback icon
                              const target =
                                e.currentTarget as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector("svg")) {
                                const icon = document.createElementNS(
                                  "http://www.w3.org/2000/svg",
                                  "svg"
                                );
                                icon.setAttribute(
                                  "class",
                                  "size-5 text-muted-foreground"
                                );
                                icon.setAttribute("fill", "none");
                                icon.setAttribute("stroke", "currentColor");
                                icon.setAttribute("viewBox", "0 0 24 24");
                                icon.innerHTML =
                                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />';
                                parent.appendChild(icon);
                              }
                            }}
                            unoptimized
                          />
                        ) : (
                          <ImageIcon className="size-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">
                      {item.itemCode || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="min-w-[180px]">
                        <div className="font-medium">{item.itemName}</div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.uom}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">
                        ₹
                        {formatPrice(item.purchasePrice)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-normal">
                        {formatGst(item.gstPercentage)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-green-700">
                        ₹
                        {formatPrice(priceWithGst)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.hsnCode || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-muted-foreground">
                        {item.openingStock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          item.quantity === 0
                            ? "text-red-600 font-bold text-base"
                            : item.quantity <= item.lowStockAlertLevel
                            ? "text-orange-600 font-bold text-base"
                            : "font-semibold text-base"
                        }
                      >
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm text-muted-foreground">
                        {item.lowStockAlertLevel}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.expiryDate ? (
                        <span className="text-sm whitespace-nowrap">
                          {new Date(item.expiryDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.quantity === 0 ? (
                        <Badge
                          variant="destructive"
                          className="bg-red-600 whitespace-nowrap"
                        >
                          <AlertCircle className="size-3 mr-1" />
                          Out of Stock
                        </Badge>
                      ) : item.quantity <= item.lowStockAlertLevel ? (
                        <Badge
                          variant="secondary"
                          className="bg-orange-100 text-orange-700 whitespace-nowrap"
                        >
                          <AlertCircle className="size-3 mr-1" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-green-600 whitespace-nowrap"
                        >
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredItems.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredItems.length === 0 ? 0 : startIndex + 1}-{endIndex}{" "}
            of {filteredItems.length} results
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 / page</SelectItem>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (currentPage > 1) {
                        handlePageChange(currentPage - 1);
                      }
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {typeof page === "number" ? (
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    ) : (
                      <PaginationEllipsis />
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (currentPage < totalPages) {
                        handlePageChange(currentPage + 1);
                      }
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
}
