const { prisma } = require("../config/database");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary/cloudinaryUpload");

// Get web settings (logo and favicon)
const getWebSettings = async (req, res) => {
  try {
    const settings = await prisma.webSettings.findFirst({
      select: {
        logoUrl: true,
        faviconUrl: true,
        logoKey: true,
        faviconKey: true,
      },
    });

    res.json({
      success: true,
      data: settings || {
        logoUrl: null,
        faviconUrl: null,
        logoKey: null,
        faviconKey: null,
      },
    });
  } catch (error) {
    console.error("Get web settings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get web settings",
    });
  }
};

// Upload logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Upload to Cloudinary
    const logoUrl = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "web-settings/logo"
    );

    // Get or create web settings
    let settings = await prisma.webSettings.findFirst();

    if (settings) {
      // Delete old logo if exists
      if (settings.logoUrl) {
        await deleteFromCloudinary(settings.logoUrl);
      }

      // Update settings
      settings = await prisma.webSettings.update({
        where: { id: settings.id },
        data: {
          logoUrl,
          logoKey: logoUrl,
        },
      });
    } else {
      // Create new settings
      settings = await prisma.webSettings.create({
        data: {
          logoUrl,
          logoKey: logoUrl,
          faviconUrl: null,
          faviconKey: null,
        },
      });
    }

    res.json({
      success: true,
      message: "Logo uploaded successfully",
      data: {
        logoUrl: settings.logoUrl,
        logoKey: settings.logoKey,
      },
    });
  } catch (error) {
    console.error("Upload logo error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload logo",
    });
  }
};

// Delete logo
const deleteLogo = async (req, res) => {
  try {
    const settings = await prisma.webSettings.findFirst();

    if (!settings || !settings.logoUrl) {
      return res.status(404).json({
        success: false,
        error: "No logo found",
      });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(settings.logoUrl);

    // Update settings
    await prisma.webSettings.update({
      where: { id: settings.id },
      data: {
        logoUrl: null,
        logoKey: null,
      },
    });

    res.json({
      success: true,
      message: "Logo deleted successfully",
    });
  } catch (error) {
    console.error("Delete logo error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete logo",
    });
  }
};

module.exports = {
  getWebSettings,
  uploadLogo,
  deleteLogo,
};
