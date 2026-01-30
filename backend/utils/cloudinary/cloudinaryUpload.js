const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'pos-commerce';

// Verify Cloudinary is configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  Cloudinary configuration incomplete. Check .env file.');
} else {
  console.log('✅ Cloudinary configured');
  console.log(`📁 Main folder: ${CLOUDINARY_FOLDER}`);
}

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @param {string} subfolder - Optional subfolder within main folder (e.g., 'items', 'pos-products')
 * @returns {Promise<string>} - Cloudinary public URL
 */
const uploadToCloudinary = async (fileBuffer, fileName, mimeType, subfolder = 'general') => {
  try {
    // Construct full folder path with main folder and subfolder
    const folderPath = `${CLOUDINARY_FOLDER}/${subfolder}`;
    const publicId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    console.log(`📁 Cloudinary Folder: ${folderPath}`);
    console.log(`📄 Uploading file: ${fileName}`);
    console.log(`🆔 Public ID: ${publicId}`);
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath, // This creates the folder structure in Cloudinary
          resource_type: 'auto',
          public_id: publicId,
          use_filename: false,
          unique_filename: false,
        },
        (error, result) => {
          if (error) {
            console.error('❌ Error uploading to Cloudinary:', error);
            reject(new Error(`Failed to upload file to Cloudinary: ${error.message}`));
          } else {
            console.log(`✅ File uploaded successfully`);
            console.log(`📍 Full public_id: ${result.public_id}`);
            console.log(`🔗 URL: ${result.secure_url}`);
            console.log(`📂 Folder created at: ${folderPath}`);
            resolve(result.secure_url);
          }
        }
      );

      // Convert buffer to stream and upload
      const bufferStream = Readable.from(fileBuffer);
      bufferStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<boolean>}
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) {
      return true;
    }

    // Extract public_id from URL
    // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234/folder/public_id.ext
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('.')[0]; // Get public_id without extension
    const publicId = `${CLOUDINARY_FOLDER}/${urlParts.slice(-2, -1)[0]}/${fileName}`;

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`✅ File deleted from Cloudinary: ${publicId}`);
      return true;
    } else {
      console.warn(`⚠️  Could not delete file from Cloudinary: ${publicId}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
    return false;
  }
};

/**
 * Get image URL (Cloudinary URLs are already permanent)
 * @param {string} imageUrl - Cloudinary image URL
 * @param {number} expiresIn - Not used for Cloudinary (kept for backward compatibility)
 * @returns {string} - Image URL
 */
const getImageUrl = (imageUrl, expiresIn = 3600) => {
  // If it's already a Cloudinary URL, return as is
  if (imageUrl && imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }
  // If it's a URL from another source, return as is
  if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return imageUrl;
  }
  // Fallback
  return imageUrl || null;
};

/**
 * Get optimized image URL with transformations
 * @param {string} imageUrl - Cloudinary image URL
 * @param {object} options - Transformation options { width, height, quality, fetch_format }
 * @returns {string} - Optimized image URL
 */
const getOptimizedImageUrl = (imageUrl, options = {}) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  try {
    const { width = 400, height = 400, quality = 'auto', fetch_format = 'auto' } = options;
    
    // Insert transformations before the filename
    // Original format: https://res.cloudinary.com/cloud_name/image/upload/v1234/folder/file.ext
    // Modified format: https://res.cloudinary.com/cloud_name/image/upload/w_400,h_400,q_auto,f_auto/v1234/folder/file.ext
    
    const parts = imageUrl.split('/upload/');
    if (parts.length !== 2) return imageUrl;

    const transformation = `w_${width},h_${height},q_${quality},f_${fetch_format}`;
    return `${parts[0]}/upload/${transformation}/${parts[1]}`;
  } catch (error) {
    console.error('Error generating optimized URL:', error);
    return imageUrl;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getImageUrl,
  getOptimizedImageUrl,
  cloudinary,
};
