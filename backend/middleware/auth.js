const jwt = require("jsonwebtoken");

/**
 * Middleware to authenticate JWT tokens
 * Verifies token from Authorization header or cookies
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = null;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Fallback to cookie if no Authorization header
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role || "user";

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Invalid token.",
    });
  }
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required.",
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
};
