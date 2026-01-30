const express = require("express");
const {
  getWebSettings,
  uploadLogo,
  deleteLogo,
} = require("../controllers/webSettingsController");
const { upload } = require("../utils/cloudinary/multerConfig");

const router = express.Router();

// Public routes - no authentication required
router.get("/web-settings", getWebSettings);

// Protected routes - require admin authentication
router.post("/logo", upload.single("logo"), uploadLogo);
router.delete("/logo",  deleteLogo);

module.exports = router;
