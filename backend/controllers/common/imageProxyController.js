const { getImageBuffer } = require("../../utils/common/imageProxy");

/**
 * Proxy Cloudinary images through backend
 * GET /api/image/*
 * 
 * Note: Cloudinary URLs are already permanent and can be used directly.
 * This endpoint is kept for:
 * - Legacy S3 image support
 * - Additional caching layer if needed
 */
const proxyImage = async (req, res) => {
  try {
    // Get the full path after /api/image/
    let imageUrl = req.path.substring(1); // Remove leading slash
    
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL/key is required",
      });
    }

    // Decode URL-encoded path
    imageUrl = decodeURIComponent(imageUrl);

    console.log(`📸 Proxying image: ${imageUrl}`);

    // Handle different URL formats
    let finalUrl = imageUrl;

    // If it's a Cloudinary key (format: cloud_name/path/to/image)
    if (!imageUrl.startsWith('http')) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dufyygz8a';
      finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${imageUrl}`;
    }

    // Fetch image buffer from Cloudinary
    const imageBuffer = await getImageBuffer(finalUrl);
    
    // Set response headers
    res.setHeader('Content-Type', 'image/jpeg'); // Default to JPEG, can be enhanced with MIME detection
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS
    
    // Send image buffer
    res.send(imageBuffer);
  } catch (error) {
    console.error("Error proxying image:", error);
    res.status(404).json({
      success: false,
      message: "Image not found",
      error: error.message,
    });
  }
};

module.exports = { proxyImage };
