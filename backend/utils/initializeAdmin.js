const bcrypt = require("bcrypt");
const { prisma } = require("../config/database");

/**
 * Auto-initialize admin user on first database connection
 * This runs automatically when the server starts
 */
async function initializeAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log(
        "⚠️  ADMIN_EMAIL and ADMIN_PASSWORD not set - skipping admin initialization"
      );
      return;
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    console.log("🌱 Initializing default admin user...");

    // Hash the admin password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin User",
        isVerified: true,
        isActive: true,
      },
    });

    console.log("✅ Default admin user created successfully!");
    console.log(`📧 Email: ${adminEmail}`);
  } catch (error) {
    console.error("❌ Error initializing admin user:", error);
  }
}

module.exports = { initializeAdmin };
