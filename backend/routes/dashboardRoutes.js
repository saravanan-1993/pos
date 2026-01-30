const express = require("express");
const {
  getDashboardMetrics,
  getSalesChartData,
  getRecentOrders,
} = require("../controllers/dashboardController");
const { authenticateToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// All dashboard routes require admin authentication
router.get("/metrics", authenticateToken, isAdmin, getDashboardMetrics);
router.get("/sales-chart", authenticateToken, isAdmin, getSalesChartData);
router.get("/recent-orders", authenticateToken, isAdmin, getRecentOrders);

module.exports = router;
