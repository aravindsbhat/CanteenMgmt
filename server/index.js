import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./auth.js";
import { verifyToken, requireAdmin, requireAuth } from "./auth.js";
import authRoutes from "./routes/auth.js";
import {
  getMenuItems,
  getMenuItemById,
  getMenuItemsByCategory,
  updateMenuItemAvailability,
  decreaseMenuItemAvailability,
  addOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getCategories,
} from "./data.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.use("/api/auth", authRoutes);

// Routes

// Get all menu items
app.get("/api/menu", (req, res) => {
  res.json(getMenuItems());
});

// Get menu items by category
app.get("/api/menu/category/:category", (req, res) => {
  const { category } = req.params;
  const filteredItems = getMenuItemsByCategory(category);
  res.json(filteredItems);
});

// Get a specific menu item
app.get("/api/menu/:id", (req, res) => {
  const { id } = req.params;
  const item = getMenuItemById(id);

  if (!item) {
    return res.status(404).json({ error: "Menu item not found" });
  }

  res.json(item);
});

// Update menu item availability (admin function)
app.put("/api/menu/:id/availability", verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { available } = req.body;

  if (typeof available !== "number" || available < 0) {
    return res.status(400).json({ error: "Invalid availability value" });
  }

  const updatedItem = updateMenuItemAvailability(id, available);

  if (!updatedItem) {
    return res.status(404).json({ error: "Menu item not found" });
  }

  res.json(updatedItem);
});

// Place an order (requires authentication)
app.post("/api/orders", verifyToken, (req, res) => {
  const { items } = req.body;
  const user = req.user;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Invalid order items" });
  }

  // Use authenticated user's information
  const customerName = user.name;
  const customerEmail = user.email;
  const customerId = user.id;

  // Validate and update availability
  const orderItems = [];
  let totalAmount = 0;

  for (const orderItem of items) {
    const menuItem = getMenuItemById(orderItem.id);

    if (!menuItem) {
      return res
        .status(404)
        .json({ error: `Menu item with id ${orderItem.id} not found` });
    }

    if (menuItem.available < orderItem.quantity) {
      return res.status(400).json({
        error: `Insufficient quantity for ${menuItem.name}. Available: ${menuItem.available}, Requested: ${orderItem.quantity}`,
      });
    }

    // Update availability using the helper function
    if (!decreaseMenuItemAvailability(orderItem.id, orderItem.quantity)) {
      return res.status(400).json({
        error: `Failed to update availability for ${menuItem.name}`,
      });
    }

    // Add to order items
    orderItems.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: orderItem.quantity,
      subtotal: menuItem.price * orderItem.quantity,
    });

    totalAmount += menuItem.price * orderItem.quantity;
  }

  // Create order
  const order = {
    id: uuidv4(),
    customerId,
    customerName,
    customerEmail,
    items: orderItems,
    totalAmount,
    status: "confirmed",
    orderTime: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
  };

  const createdOrder = addOrder(order);
  res.status(201).json(createdOrder);
});

// Get all orders (admin function)
app.get("/api/orders", verifyToken, requireAdmin, (req, res) => {
  res.json(getOrders());
});

// Get user's own orders
app.get("/api/orders/my-orders", verifyToken, (req, res) => {
  const userOrders = getOrders().filter(
    (order) => order.customerId === req.user.id
  );
  res.json(userOrders);
});

// Get order by ID
app.get("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const order = getOrderById(id);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json(order);
});

// Update order status (admin function)
app.put("/api/orders/:id/status", verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = [
    "confirmed",
    "preparing",
    "ready",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const updatedOrder = updateOrderStatus(id, status);

  if (!updatedOrder) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json(updatedOrder);
});

// Get categories
app.get("/api/categories", (req, res) => {
  const categories = getCategories();
  res.json(categories);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🍽️  Canteen Management Server running on port ${PORT}`);
  console.log(`📱 Menu API: http://localhost:${PORT}/api/menu`);
  console.log(`📋 Orders API: http://localhost:${PORT}/api/orders`);
});
