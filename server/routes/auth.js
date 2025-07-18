import express from "express";
import passport from "../auth.js";
import { generateToken, verifyToken, requireAdmin } from "../auth.js";
import db from "../models/database.js";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role = "customer" } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Email, password, and name are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await db.User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists",
      });
    }

    // Create user with plain text password (for development)
    const newUser = await db.User.create({
      email: email.toLowerCase(),
      password: password, // Store plain text password for now
      name,
      role: role === "admin" ? "admin" : "customer", // Only allow admin if explicitly set
    });

    // Generate token
    const token = generateToken(newUser);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle Sequelize validation errors
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => {
        if (err.path === "email" && err.validatorKey === "isEmail") {
          return "Please enter a valid email address";
        }
        return err.message;
      });
      return res.status(400).json({
        error: validationErrors[0] || "Validation error",
      });
    }

    // Handle unique constraint errors (duplicate email)
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        error: "User with this email already exists",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// Login user
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Authentication error" });
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message || "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      user,
      token,
    });
  })(req, res, next);
});

// Get current user profile
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    user: req.user,
  });
});

// Update user profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!name && !email) {
      return res.status(400).json({
        error: "At least one field (name or email) is required",
      });
    }

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await db.User.findOne({
        where: { email: email.toLowerCase() },
      });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          error: "Email is already taken",
        });
      }
    }

    // Update user data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();

    const [updatedRows] = await db.User.update(updateData, {
      where: { id: userId },
    });

    if (updatedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get updated user
    const updatedUser = await db.User.findByPk(userId);
    const { password: _, ...userWithoutPassword } = updatedUser.toJSON();

    res.json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Change password
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long",
      });
    }

    // Get user with password
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password (plain text comparison for development)
    const isValidPassword = currentPassword === user.password;
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Update password (store as plain text for development)
    const [updatedRows] = await db.User.update(
      { password: newPassword },
      { where: { id: userId } }
    );

    if (updatedRows === 0) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin: Get all users
router.get("/users", verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ["password"] }, // Exclude password from response
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Logout (mainly for client-side token removal)
router.post("/logout", verifyToken, (req, res) => {
  res.json({
    message: "Logout successful",
  });
});

// Check authentication status
router.get("/check", verifyToken, (req, res) => {
  res.json({
    authenticated: true,
    user: req.user,
  });
});

export default router;
