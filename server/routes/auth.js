import express from "express";
import bcrypt from "bcryptjs";
import passport from "../auth.js";
import { generateToken, verifyToken, requireAdmin } from "../auth.js";
import {
  getUserByEmail,
  createUser,
  getUsers,
  getUserById,
  updateUser,
} from "../data.js";

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
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: "User with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = createUser({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role === "admin" ? "admin" : "customer", // Only allow admin if explicitly set
    });

    // Generate token
    const token = generateToken(newUser);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
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
      const existingUser = getUserByEmail(email);
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

    const updatedUser = updateUser(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

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
    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const updatedUser = updateUser(userId, { password: hashedNewPassword });

    if (!updatedUser) {
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
router.get("/users", verifyToken, requireAdmin, (req, res) => {
  const users = getUsers();

  // Remove passwords from response
  const usersWithoutPasswords = users.map((user) => {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  res.json(usersWithoutPasswords);
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
