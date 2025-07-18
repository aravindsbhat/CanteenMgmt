import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./auth.js";
import { verifyToken, requireAdmin, requireAuth } from "./auth.js";
import authRoutes from "./routes/auth.js";
import db from "./models/database.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:3000",
      "http://localhost:5173", // Vite default port
    ],
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
app.get("/api/menu", async (req, res) => {
  try {
    const menuItems = await db.MenuItem.findAll();
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// Get menu items by category
app.get("/api/menu/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const menuItems = await db.MenuItem.findAll({
      where: { category },
    });
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items by category:", error);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// Get a specific menu item
app.get("/api/menu/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.MenuItem.findByPk(id);

    if (!item) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({ error: "Failed to fetch menu item" });
  }
});

// Update menu item availability (admin function)
app.put(
  "/api/menu/:id/availability",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { available } = req.body;

      if (typeof available !== "number" || available < 0) {
        return res.status(400).json({ error: "Invalid availability value" });
      }

      const [updatedRows] = await db.MenuItem.update(
        { available },
        { where: { id } }
      );

      if (updatedRows === 0) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      const updatedItem = await db.MenuItem.findByPk(id);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating menu item availability:", error);
      res.status(500).json({ error: "Failed to update menu item" });
    }
  }
);

// Place an order (requires authentication)
app.post("/api/orders", verifyToken, async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { items } = req.body;
    const user = req.user;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: "Invalid order items" });
    }

    // Validate and update availability
    const orderItems = [];
    let totalAmount = 0;

    for (const orderItem of items) {
      const menuItem = await db.MenuItem.findByPk(orderItem.menuItemId, {
        transaction,
      });

      if (!menuItem) {
        await transaction.rollback();
        return res.status(404).json({
          error: `Menu item with id ${orderItem.menuItemId} not found`,
        });
      }

      if (menuItem.available < orderItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          error: `Insufficient quantity for ${menuItem.name}. Available: ${menuItem.available}, Requested: ${orderItem.quantity}`,
        });
      }

      // Update availability
      await menuItem.update(
        { available: menuItem.available - orderItem.quantity },
        { transaction }
      );

      // Add to order items
      orderItems.push({
        menuItemId: menuItem.id,
        quantity: orderItem.quantity,
        price: menuItem.price,
      });

      totalAmount += menuItem.price * orderItem.quantity;
    }

    // Create order
    const order = await db.Order.create(
      {
        userId: user.id,
        total: totalAmount,
        status: "confirmed",
      },
      { transaction }
    );

    // Create order items
    for (const item of orderItems) {
      await db.OrderItem.create(
        {
          orderId: order.id,
          ...item,
        },
        { transaction }
      );
    }

    await transaction.commit();

    // Fetch the complete order with items and menu details
    const completeOrder = await db.Order.findByPk(order.id, {
      include: [
        {
          model: db.OrderItem,
          as: "items",
          include: [
            {
              model: db.MenuItem,
              as: "menuItem",
              attributes: ["id", "name", "price"],
            },
          ],
        },
        {
          model: db.User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating order:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    res.status(500).json({
      error: "Failed to create order",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get all orders (admin function)
app.get("/api/orders", verifyToken, requireAdmin, async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [
        {
          model: db.OrderItem,
          as: "items",
          include: [
            {
              model: db.MenuItem,
              as: "menuItem",
              attributes: ["id", "name", "price"],
            },
          ],
        },
        {
          model: db.User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get user's own orders
app.get("/api/orders/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: db.OrderItem,
          as: "items",
          include: [
            {
              model: db.MenuItem,
              as: "menuItem",
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get order by ID
app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db.Order.findByPk(id, {
      include: [
        {
          model: db.OrderItem,
          as: "items",
          include: [
            {
              model: db.MenuItem,
              as: "menuItem",
              attributes: ["id", "name", "price"],
            },
          ],
        },
        {
          model: db.User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Update order status (admin function)
app.put(
  "/api/orders/:id/status",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    try {
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

      const [updatedRows] = await db.Order.update(
        { status },
        { where: { id } }
      );

      if (updatedRows === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      const updatedOrder = await db.Order.findByPk(id, {
        include: [
          {
            model: db.OrderItem,
            as: "items",
            include: [
              {
                model: db.MenuItem,
                as: "menuItem",
                attributes: ["id", "name", "price"],
              },
            ],
          },
          {
            model: db.User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  }
);

// Get categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await db.MenuItem.findAll({
      attributes: [
        [db.sequelize.fn("DISTINCT", db.sequelize.col("category")), "category"],
      ],
      raw: true,
    });
    res.json(categories.map((item) => item.category));
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
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
