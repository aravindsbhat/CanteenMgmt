import { Sequelize, DataTypes } from "sequelize";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read config
const configFile = readFileSync(
  join(__dirname, "../config/config.json"),
  "utf8"
);
const config = JSON.parse(configFile);
const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false, // Set to console.log to see SQL queries
  }
);

// Import models
import User from "./user.js";
import MenuItem from "./menuitem.js";
import Order from "./order.js";
import OrderItem from "./orderitem.js";

// Initialize models
const UserModel = User(sequelize, DataTypes);
const MenuItemModel = MenuItem(sequelize, DataTypes);
const OrderModel = Order(sequelize, DataTypes);
const OrderItemModel = OrderItem(sequelize, DataTypes);

// Define associations
UserModel.hasMany(OrderModel, { foreignKey: "userId", as: "orders" });
OrderModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

OrderModel.hasMany(OrderItemModel, { foreignKey: "orderId", as: "items" });
OrderItemModel.belongsTo(OrderModel, { foreignKey: "orderId", as: "order" });

MenuItemModel.hasMany(OrderItemModel, {
  foreignKey: "menuItemId",
  as: "orderItems",
});
OrderItemModel.belongsTo(MenuItemModel, {
  foreignKey: "menuItemId",
  as: "menuItem",
});

// Export models and sequelize instance
export {
  sequelize,
  UserModel as User,
  MenuItemModel as MenuItem,
  OrderModel as Order,
  OrderItemModel as OrderItem,
};

export default {
  sequelize,
  User: UserModel,
  MenuItem: MenuItemModel,
  Order: OrderModel,
  OrderItem: OrderItemModel,
};
