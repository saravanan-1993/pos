const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { prisma } = require("../config/database");
const nodemailer = require("nodemailer");

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate JWT Token
const generateToken = (adminId) => {
  return jwt.sign({ userId: adminId, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Generate random token
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    console.log(`🔍 Admin login attempt:`, email);

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        error: "Account is deactivated. Please contact support.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    // Generate token
    const token = generateToken(admin.id);

    // Set httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    console.log("✅ Admin login successful:", admin.email);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: "admin",
          isVerified: admin.isVerified,
        },
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found with this email",
      });
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Update admin with reset token
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Reset Your Password - Admin Portal",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${admin.name},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #6B7280;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send password reset email",
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: "Token and password are required",
      });
    }

    // Find admin with valid reset token
    const admin = await prisma.admin.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update admin password
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Password reset failed",
    });
  }
};

// Get Current Admin
const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        isActive: true,
        lastLogin: true,
        companyName: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        phoneNumber: true,
        gstNumber: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...admin,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Get current admin error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get admin data",
    });
  }
};

// Update Admin Profile
const updateAdminProfile = async (req, res) => {
  try {
    const {
      companyName,
      address,
      city,
      state,
      zipCode,
      country,
      phoneNumber,
      gstNumber,
      name,
    } = req.body;

    // Validate company name if provided
    if (companyName !== undefined && !companyName?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Company name cannot be empty",
      });
    }

    // Validate GST format if provided
    if (gstNumber) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber)) {
        return res.status(400).json({
          success: false,
          error: "Invalid GST number format. Example: 22AAAAA0000A1Z5",
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (companyName !== undefined) updateData.companyName = companyName;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (country !== undefined) updateData.country = country;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber;
    if (name !== undefined) updateData.name = name;

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        isVerified: true,
        isActive: true,
        companyName: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        phoneNumber: true,
        gstNumber: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        ...updatedAdmin,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update admin profile",
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // Clear httpOnly cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
};

module.exports = {
  adminLogin,
  forgotPassword,
  resetPassword,
  getCurrentAdmin,
  updateAdminProfile,
  logout,
};
