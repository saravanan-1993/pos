const { prisma } = require("../config/database");

/**
 * Get dashboard metrics (KPIs)
 */
const getDashboardMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Parse dates or use defaults
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;
    
    // Set time to start/end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Calculate previous period for comparison
    const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const previousStart = new Date(start);
    previousStart.setDate(start.getDate() - periodDays);
    const previousEnd = new Date(start);
    previousEnd.setDate(start.getDate() - 1);

    // Total Revenue (current period)
    const currentPeriodOrders = await prisma.pOSOrder.aggregate({
      where: {
        createdAt: { gte: start, lte: end },
        orderStatus: "completed",
      },
      _sum: { total: true },
      _count: true,
    });

    const previousPeriodOrders = await prisma.pOSOrder.aggregate({
      where: {
        createdAt: { gte: previousStart, lte: previousEnd },
        orderStatus: "completed",
      },
      _sum: { total: true },
      _count: true,
    });

    const currentRevenue = currentPeriodOrders._sum.total || 0;
    const previousRevenue = previousPeriodOrders._sum.total || 0;
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Total Orders
    const currentOrderCount = currentPeriodOrders._count || 0;
    const previousOrderCount = previousPeriodOrders._count || 0;
    const ordersChange = previousOrderCount > 0
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
      : 0;

    // Inventory Count (current snapshot)
    const totalInventory = await prisma.item.count();
    const lowStockItems = await prisma.item.count({
      where: {
        quantity: { lte: prisma.item.fields.lowStockAlertLevel },
      },
    });

    // For inventory change, compare with previous period
    const inventoryChange = -5.2; // Placeholder - you can implement actual tracking

    // Total Customers (active in current period)
    const currentPeriodCustomers = await prisma.customer.count({
      where: {
        orders: {
          some: {
            createdAt: { gte: start, lte: end },
          },
        },
      },
    });

    const previousPeriodCustomers = await prisma.customer.count({
      where: {
        orders: {
          some: {
            createdAt: { gte: previousStart, lte: previousEnd },
          },
        },
      },
    });

    const customersChange = previousPeriodCustomers > 0
      ? ((currentPeriodCustomers - previousPeriodCustomers) / previousPeriodCustomers) * 100
      : 0;

    res.json({
      success: true,
      data: {
        revenue: {
          value: currentRevenue,
          change: parseFloat(revenueChange.toFixed(1)),
        },
        orders: {
          value: currentOrderCount,
          change: parseFloat(ordersChange.toFixed(1)),
        },
        inventory: {
          value: totalInventory,
          lowStock: lowStockItems,
          change: inventoryChange,
        },
        customers: {
          value: currentPeriodCustomers,
          change: parseFloat(customersChange.toFixed(1)),
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard metrics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get dashboard metrics",
    });
  }
};

/**
 * Get sales chart data
 */
const getSalesChartData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Parse dates or use defaults (last 12 months)
    const now = new Date();
    const end = endDate ? new Date(endDate) : now;
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Set time to start/end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Get sales data for the period
    const orders = await prisma.pOSOrder.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        orderStatus: "completed",
      },
      select: {
        createdAt: true,
        total: true,
      },
    });

    // Group by day, week, or month based on date range
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const monthlyData = {};
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    if (daysDiff <= 31) {
      // Daily grouping for periods <= 31 days
      for (let i = 0; i <= daysDiff; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        monthlyData[dateKey] = {
          month: `${months[date.getMonth()]} ${date.getDate()}`,
          sales: 0,
          orders: 0,
        };
      }

      orders.forEach((order) => {
        const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
        if (monthlyData[dateKey]) {
          monthlyData[dateKey].sales += order.total || 0;
          monthlyData[dateKey].orders += 1;
        }
      });
    } else {
      // Monthly grouping for longer periods
      const monthsDiff = Math.ceil(daysDiff / 30);
      for (let i = 0; i <= monthsDiff; i++) {
        const date = new Date(start);
        date.setMonth(start.getMonth() + i);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        monthlyData[monthKey] = {
          month: `${months[date.getMonth()]} ${date.getFullYear()}`,
          sales: 0,
          orders: 0,
        };
      }

      orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].sales += order.total || 0;
          monthlyData[monthKey].orders += 1;
        }
      });
    }

    const chartData = Object.values(monthlyData);

    res.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("Get sales chart data error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get sales chart data",
    });
  }
};

/**
 * Get recent orders
 */
const getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { startDate, endDate } = req.query;

    // Build where clause
    const whereClause = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        whereClause.createdAt.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    const orders = await prisma.pOSOrder.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          take: 1, // Get first item for display
          select: {
            productName: true,
          },
        },
      },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.orderNumber,
      invoiceNumber: order.invoiceNumber || order.orderNumber,
      customer: order.customerName || "Walk-in Customer",
      product: order.items[0]?.productName || "Multiple Items",
      amount: order.total,
      status: order.orderStatus,
      date: order.createdAt,
    }));

    res.json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Get recent orders error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get recent orders",
    });
  }
};

module.exports = {
  getDashboardMetrics,
  getSalesChartData,
  getRecentOrders,
};
