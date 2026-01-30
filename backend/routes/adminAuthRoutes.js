const express = require("express");
const {
  adminLogin,
  forgotPassword,
  resetPassword,
  getCurrentAdmin,
  updateAdminProfile,
  logout,
} = require("../controllers/adminAuthController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", authenticateToken, getCurrentAdmin);
router.put("/profile", authenticateToken, updateAdminProfile);
router.post("/logout", authenticateToken, logout);

module.exports = router;
