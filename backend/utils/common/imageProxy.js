const axios = require('axios');
require("dotenv").config();

/**
 * Get image URL from Cloudinary
 * Handles both direct Cloudinary URLs and legacy S3 URLs
 * @param {string} imageUrl - Cloudinary URL or S3 key
 * @returns {string|null} - Valid image URL
 */
const getProxyImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If already a Cloudinary URL, return as-is
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  
  // If already a full URL (from other sources), return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path or key, treat as Cloudinary URL
  // This handles legacy S3 keys that are now stored as Cloudinary URLs
  return imageUrl;
};

/**
 * Fetch image from Cloudinary for streaming/proxy
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<Buffer>} - Image buffer
 */
const getImageBuffer = async (imageUrl) => {
  if (!imageUrl) {
    throw new Error("Image URL is required");
  }

  // Decode if it's URL encoded
  imageUrl = decodeURIComponent(imageUrl);

  try {
    // Validate it's a Cloudinary URL
    if (!imageUrl.includes('cloudinary.com')) {
      throw new Error("Invalid image URL");
    }

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000, // 10 second timeout
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching image from Cloudinary:", error.message);
    throw new Error("Failed to get file from Cloudinary");
  }
};

module.exports = { 
  getProxyImageUrl, 
  getImageBuffer 
};

