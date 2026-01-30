/**
 * @deprecated This file is deprecated. Use cloudinary/cloudinaryUpload.js instead.
 * 
 * This file was used for AWS S3 uploads and has been replaced with Cloudinary.
 * All image uploads now use the Cloudinary integration.
 * 
 * To use: const { uploadToCloudinary, deleteFromCloudinary } = require('../cloudinary/cloudinaryUpload');
 */

module.exports = {
  upload: null,
  uploadToS3: null,
  deleteFromS3: null,
  getPresignedUrl: null,
  s3Client: null,
};

