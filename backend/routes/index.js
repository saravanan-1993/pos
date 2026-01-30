const express = require('express');

// Auth routes
const adminAuthRoutes = require('./adminAuthRoutes');

// Dashboard routes
const dashboardRoutes = require('./dashboardRoutes');

// Web settings routes
const webSettingsRoutes = require('./webSettingsRoutes');

// Common routes
const imageProxyRoutes = require('./common/imageProxyRoutes');

// Finance routes
const gstRateRoutes = require('./finance/gstRateRoutes');
const invoiceSettingsRoutes = require('./finance/invoiceSettingsRoutes');
const salesRoutes = require('./finance/salesRoutes');
const transactionRoutes = require('./finance/transactionRoutes');
const salesReportRoutes = require('./finance/salesReportRoutes');

// Customer routes
const customerRoutes = require('./customer/customerRoutes');


// Inventory routes
const categoryRoutes = require('./inventory/categoryRoutes');
const itemRoutes = require('./inventory/itemRoutes');
const warehouseRoutes = require('./inventory/warehouseRoutes');
const stockAdjustmentRoutes = require('./inventory/stockAdjustmentRoutes');
const inventoryReportRoutes = require('./inventory/reportRoutes');



// POS routes
const posProductRoutes = require('./pos/posProductRoutes');
const posBarcodeRoutes = require('./pos/posBarcodeRoutes');
const posOrderRoutes = require('./pos/posOrderRoutes');
const posInvoiceRoutes = require('./pos/posInvoiceRoutes');



const router = express.Router();

// Root route - API information
router.get('/', (req, res) => {
  res.json({
    message: 'Monolith E-Commerce API is running',
    version: '1.0.0',
    architecture: 'monolith',
    database: 'monolith-ecommerce',
    timestamp: new Date().toISOString(),
  });
});


// Admin auth routes
router.use('/admin/auth', adminAuthRoutes);

// Dashboard routes (protected)
router.use('/dashboard', dashboardRoutes);

// Web settings routes (public)
router.use('/web', webSettingsRoutes);

// Image proxy route (must be before auth to allow public access)
router.use('/image', imageProxyRoutes);

// Finance routes
router.use('/finance/gst-rates', gstRateRoutes);
router.use('/finance/invoice-settings', invoiceSettingsRoutes);
router.use('/finance/sales', salesRoutes);
router.use('/finance/transactions', transactionRoutes);
router.use('/finance/reports', salesReportRoutes);

// Customer routes
router.use('/customer', customerRoutes);

// Inventory routes
router.use('/inventory/categories', categoryRoutes);
router.use('/inventory/items', itemRoutes);
router.use('/inventory/warehouses', warehouseRoutes);
router.use('/inventory/stock-adjustments', stockAdjustmentRoutes);
router.use('/inventory/reports', inventoryReportRoutes);


// POS routes
router.use('/pos/products', posProductRoutes);
router.use('/pos/barcodes', posBarcodeRoutes);
router.use('/pos/orders', posOrderRoutes);
router.use('/pos/invoices', posInvoiceRoutes);


module.exports = router;
