const { prisma } = require("../../config/database");
const multer = require("multer");
const path = require("path");
const { uploadToCloudinary, deleteFromCloudinary, getImageUrl } = require("../../utils/cloudinary/cloudinaryUpload");
const { syncOnlineProductStock } = require("../../utils/inventory/stockUpdateService");
const { upload } = require("../../utils/cloudinary/multerConfig");

// Get all items
const getAllItems = async (req, res) => {
  try {
    const { category, warehouse, status } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (warehouse) filter.warehouseId = warehouse;
    if (status) filter.status = status;

    const items = await prisma.item.findMany({
      where: filter,
      include: { warehouse: true },
      orderBy: { createdAt: "desc" },
    });

    const itemsWithImageUrls = await Promise.all(
      items.map((item) => ({
        ...item,
        itemImage: item.itemImage ? getImageUrl(item.itemImage) : null,
      }))
    );

    res.status(200).json({
      success: true,
      data: itemsWithImageUrls,
      count: itemsWithImageUrls.length,
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch items",
      message: error.message,
    });
  }
};

// Get item by ID
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: { warehouse: true },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found",
      });
    }

    const itemWithImageUrl = {
      ...item,
      itemImage: item.itemImage ? getImageUrl(item.itemImage) : null,
    };

    res.status(200).json({
      success: true,
      data: itemWithImageUrl,
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch item",
      message: error.message,
    });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const {
      itemName, category, itemCode, uom, purchasePrice, gstRateId, gstPercentage,
      hsnCode, warehouse, openingStock, lowStockAlertLevel, status, expiryDate, description,
    } = req.body;

    if (!itemName || !category || !uom || !purchasePrice || !gstPercentage || !warehouse || !openingStock || !lowStockAlertLevel) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: ["itemName", "category", "uom", "purchasePrice", "gstPercentage", "warehouse", "openingStock", "lowStockAlertLevel"],
      });
    }

    // Check for duplicate SKU/itemCode
    if (itemCode && itemCode.trim() !== "") {
      const existingItem = await prisma.item.findFirst({
        where: { itemCode: itemCode.trim() },
      });

      if (existingItem) {
        return res.status(400).json({
          success: false,
          error: "Duplicate SKU/Item Code",
          message: `An item with SKU/Item Code "${itemCode.trim()}" already exists.`,
        });
      }
    }

    // Verify warehouse exists
    const warehouseExists = await prisma.warehouse.findUnique({
      where: { id: warehouse },
    });

    if (!warehouseExists) {
      return res.status(404).json({
        success: false,
        error: "Warehouse not found",
      });
    }

    // Handle image upload to Cloudinary
    let itemImage = null;
    if (req.file) {
      try {
        itemImage = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype, 'items');
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to upload image",
          message: error.message,
        });
      }
    }

    const quantity = parseInt(openingStock);
    const alertLevel = parseInt(lowStockAlertLevel);
    
    // Auto-calculate status based on quantity
    let autoStatus;
    if (quantity === 0) {
      autoStatus = "out_of_stock";
    } else if (quantity <= alertLevel) {
      autoStatus = "low_stock";
    } else {
      autoStatus = "in_stock";
    }

    const item = await prisma.item.create({
      data: {
        itemName,
        category,
        itemCode: itemCode || null,
        uom,
        purchasePrice: parseFloat(purchasePrice),
        gstRateId: gstRateId || null,
        gstPercentage: parseFloat(gstPercentage),
        hsnCode: hsnCode || null,
        warehouseId: warehouse,
        openingStock: quantity,
        quantity: quantity,
        lowStockAlertLevel: alertLevel,
        status: autoStatus,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        description: description || null,
        itemImage,
      },
      include: { warehouse: true },
    });

   

    // Auto-create POS product (display = inactive by default)
    try {
      await prisma.pOSProduct.create({
        data: {
          itemId: item.id,
          itemName: item.itemName,
          category: item.category,
          itemCode: item.itemCode,
          barcode: item.barcode,
          brand: item.brand,
          uom: item.uom,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          mrp: item.mrp,
          gstRateId: item.gstRateId,
          gstPercentage: item.gstPercentage,
          hsnCode: item.hsnCode,
          discountType: item.discountType,
          discountValue: item.discountValue,
          warehouse: item.warehouse.name,
          quantity: item.quantity,
          openingStock: item.openingStock,
          lowStockAlertLevel: item.lowStockAlertLevel,
          status: item.status,
          display: 'inactive', // Inactive by default - admin can activate later
          expiryDate: item.expiryDate,
          mfgDate: item.mfgDate,
          batchNo: item.batchNo,
          safetyInformation: item.safetyInformation,
          description: item.description,
          itemImage: item.itemImage,
          lastSyncedFromItem: new Date(),
        },
      });
      console.log(`✅ Auto-created POS product for item: ${item.itemName}`);
    } catch (posError) {
      console.error('⚠️ Failed to auto-create POS product:', posError);
      // Don't fail the item creation if POS product creation fails
    }

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: item,
    });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create item",
      message: error.message,
    });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      itemName, category, itemCode, uom, purchasePrice, gstRateId, gstPercentage,
      hsnCode, warehouse, openingStock, lowStockAlertLevel, status, expiryDate, description,
    } = req.body;

    const existingItem = await prisma.item.findUnique({ where: { id } });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: "Item not found",
      });
    }

    // Check for duplicate SKU/itemCode
    if (itemCode && itemCode.trim() !== "") {
      const duplicateItem = await prisma.item.findFirst({
        where: {
          itemCode: itemCode.trim(),
          id: { not: id },
        },
      });

      if (duplicateItem) {
        return res.status(400).json({
          success: false,
          error: "Duplicate SKU/Item Code",
          message: `An item with SKU/Item Code "${itemCode.trim()}" already exists.`,
        });
      }
    }

    // Handle image upload to Cloudinary
    let itemImage = existingItem.itemImage;
    if (req.file) {
      try {
        if (existingItem.itemImage) {
          await deleteFromCloudinary(existingItem.itemImage);
        }
        itemImage = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype, 'items');
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to upload image",
          message: error.message,
        });
      }
    }

    const quantity = existingItem.quantity;
    const alertLevel = parseInt(lowStockAlertLevel);
    
    // Auto-calculate status based on current quantity
    let autoStatus;
    if (quantity === 0) {
      autoStatus = "out_of_stock";
    } else if (quantity <= alertLevel) {
      autoStatus = "low_stock";
    } else {
      autoStatus = "in_stock";
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        itemName,
        category,
        itemCode,
        uom,
        purchasePrice: parseFloat(purchasePrice),
        gstRateId: gstRateId || null,
        gstPercentage: parseFloat(gstPercentage),
        hsnCode,
        warehouse,
        openingStock: parseInt(openingStock),
        lowStockAlertLevel: alertLevel,
        status: autoStatus,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        description,
        itemImage,
      },
      include: { warehouse: true },
    });

    

    // Auto-sync POS product if exists (update stock and status only)
    try {
      const posProduct = await prisma.pOSProduct.findFirst({
        where: { itemId: item.id },
      });

      if (posProduct) {
        await prisma.pOSProduct.update({
          where: { id: posProduct.id },
          data: {
            quantity: item.quantity,
            status: item.status,
            warehouse: item.warehouse.name,
            lastSyncedFromItem: new Date(),
          },
        });
        console.log(`✅ Auto-synced POS product for item: ${item.itemName}`);
      }
    } catch (posError) {
      console.error('⚠️ Failed to auto-sync POS product:', posError);
      // Don't fail the item update if POS sync fails
    }

    // Auto-sync OnlineProduct totalStockQuantity if this item is used in variants
    try {
      await syncOnlineProductStock(item.id);
    } catch (onlineError) {
      console.error('⚠️ Failed to auto-sync OnlineProduct:', onlineError);
      // Don't fail the item update if OnlineProduct sync fails
    }

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: item,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update item",
      message: error.message,
    });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = await prisma.item.findUnique({ where: { id } });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: "Item not found",
      });
    }

    if (existingItem.itemImage) {
      await deleteFromCloudinary(existingItem.itemImage);
    }

    await prisma.item.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete item",
      message: error.message,
    });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  upload,
};
