"use client";

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { 
  getDashboardMetrics, 
  getSalesChartData, 
  getRecentOrders,
  type DashboardMetrics,
  type SalesChartData,
  type RecentOrder
} from '@/services/dashboardService';
import { DateRangePicker, DateRangePreset } from '@/components/Dashboard/date-range-picker';
import { toast } from 'sonner';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  iconBgColor: string;
}

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing' | 'cancelled';
  date: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, iconBgColor }) => {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center text-xs mt-1">
          {isPositive ? (
            <>
              <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400 mr-1" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                +{change}%
              </span>
            </>
          ) : (
            <>
              <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400 mr-1" />
              <span className="text-red-600 dark:text-red-400 font-medium">
                {change}%
              </span>
            </>
          )}
          <span className="text-muted-foreground ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [salesData, setSalesData] = useState<SalesChartData[]>([]);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 29);
    return { from: last30Days, to: today };
  });
  const [preset, setPreset] = useState<DateRangePreset>("last30days");

  const fetchDashboardData = React.useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    try {
      setIsLoading(true);
      
      const startDate = dateRange.from.toISOString();
      const endDate = dateRange.to.toISOString();
      
      // Fetch all data in parallel
      const [metricsData, chartData, ordersData] = await Promise.all([
        getDashboardMetrics(startDate, endDate),
        getSalesChartData(startDate, endDate),
        getRecentOrders(10, startDate, endDate),
      ]);

      setMetrics(metricsData);
      setSalesData(chartData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchDashboardData();
    }
  }, [dateRange, fetchDashboardData]);

  const chartConfig: ChartConfig = {
    sales: {
      label: 'Sales',
      color: 'hsl(var(--chart-1))',
    },
    orders: {
      label: 'Orders',
      color: 'hsl(var(--chart-2))',
    },
  };

  const getStatusBadge = (status: Order['status']) => {
    const variants: Record<Order['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      completed: { variant: 'default', label: 'Completed' },
      pending: { variant: 'secondary', label: 'Pending' },
      processing: { variant: 'outline', label: 'Processing' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          preset={preset}
          onPresetChange={setPreset}
        />
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={`₹${metrics.revenue.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={metrics.revenue.change}
            icon={<DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />}
            iconBgColor="bg-green-100 dark:bg-green-900/20"
          />
          <MetricCard
            title="Orders"
            value={metrics.orders.value.toLocaleString()}
            change={metrics.orders.change}
            icon={<ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900/20"
          />
          <MetricCard
            title="Inventory"
            value={metrics.inventory.value.toLocaleString()}
            change={metrics.inventory.change}
            icon={<Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
            iconBgColor="bg-orange-100 dark:bg-orange-900/20"
          />
          <MetricCard
            title="Customers"
            value={metrics.customers.value.toLocaleString()}
            change={metrics.customers.change}
            icon={<Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            iconBgColor="bg-purple-100 dark:bg-purple-900/20"
          />
        </div>
      )}

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>
            Monthly sales and order trends for the past year
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-sales)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs"
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="var(--color-sales)"
                    fill="url(#fillSales)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No sales data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            {orders.length > 0 
              ? `You have ${orders.length} recent orders` 
              : 'No recent orders'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.invoiceNumber}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>₹{order.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString('en-IN')}</TableCell>
                      
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No orders found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
