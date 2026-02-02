import axiosInstance from "@/lib/axios";

export interface DashboardMetrics {
  revenue: {
    value: number;
    change: number;
  };
  orders: {
    value: number;
    change: number;
  };
  inventory: {
    value: number;
    lowStock: number;
    change: number;
  };
  customers: {
    value: number;
    newThisMonth: number;
    change: number;
  };
}

export interface SalesChartData {
  month: string;
  sales: number;
  orders: number;
}

export interface RecentOrder {
  id: string;
  invoiceNumber: string;
  customer: string;
  product: string;
  amount: number;
  status: "completed" | "pending" | "processing" | "cancelled";
  date: string;
}

/**
 * Get dashboard metrics (KPIs)
 */
export const getDashboardMetrics = async (
  startDate?: string,
  endDate?: string
): Promise<DashboardMetrics> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axiosInstance.get(
      `/api/dashboard/metrics?${params.toString()}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    throw error;
  }
};

/**
 * Get sales chart data
 */
export const getSalesChartData = async (
  startDate?: string,
  endDate?: string
): Promise<SalesChartData[]> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axios.get(
      `${API_URL}/api/dashboard/sales-chart?${params.toString()}`,
      {
        withCredentials: true,Instance.get(
      `/api/dashboard/sales-chart?${params.toString()}`ch (error) {
    console.error("Error fetching sales chart data:", error);
    throw error;
  }
};

/**
 * Get recent orders
 */
export const getRecentOrders = async (
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<RecentOrder[]> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axios.get(
      `${API_URL}/api/dashboard/recent-orders?${params.toString()}`,
      {
        withCredentials: true,
      }
    );
    return response.data.data;Instance.get(
      `/api/dashboard/recent-orders?${params.toString()}`
};
