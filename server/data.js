// In-memory data storage for the canteen management system
// In production, this would be replaced with a database

export let menuItems = [
  {
    id: "1",
    name: "Veg Thali",
    price: 120,
    category: "Main Course",
    available: 25,
    image:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop",
  },
  {
    id: "2",
    name: "Chicken Biryani",
    price: 180,
    category: "Main Course",
    available: 15,
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=300&h=200&fit=crop",
  },
  {
    id: "3",
    name: "Masala Dosa",
    price: 80,
    category: "South Indian",
    available: 30,
    image:
      "https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&h=200&fit=crop",
  },
  {
    id: "4",
    name: "Paneer Butter Masala",
    price: 150,
    category: "Main Course",
    available: 20,
    image:
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&h=200&fit=crop",
  },
  {
    id: "5",
    name: "Samosa (2 pcs)",
    price: 40,
    category: "Snacks",
    available: 50,
    image:
      "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd9?w=300&h=200&fit=crop",
  },
  {
    id: "6",
    name: "Mango Lassi",
    price: 60,
    category: "Beverages",
    available: 40,
    image:
      "https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=300&h=200&fit=crop",
  },
  {
    id: "7",
    name: "Chole Bhature",
    price: 110,
    category: "North Indian",
    available: 18,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop",
  },
  {
    id: "8",
    name: "Filter Coffee",
    price: 25,
    category: "Beverages",
    available: 60,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop",
  },
];

export let orders = [];

// Users storage (in production, use a database)
export let users = [
  {
    id: "admin-1",
    email: "admin@canteen.com",
    password: "$2a$10$kStC1DLmns/Y.HYZi6mL/.APust2q3o6njMNh7Uxa6eMWnJEDDVzW", // password: admin123
    name: "Admin User",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "customer-1",
    email: "customer@example.com",
    password: "$2a$10$CQOJP6d4DDVI8DGkze/aQOFdyMCZDaLeq158E3c5aeg6cgwsRg97G", // password: customer123
    name: "John Doe",
    role: "customer",
    createdAt: new Date().toISOString(),
  },
];

// Helper functions for data operations

export const getMenuItems = () => menuItems;

export const getMenuItemById = (id) => menuItems.find((item) => item.id === id);

export const getMenuItemsByCategory = (category) =>
  menuItems.filter(
    (item) => item.category.toLowerCase() === category.toLowerCase()
  );

export const updateMenuItemAvailability = (id, available) => {
  const itemIndex = menuItems.findIndex((item) => item.id === id);
  if (itemIndex !== -1) {
    menuItems[itemIndex].available = available;
    return menuItems[itemIndex];
  }
  return null;
};

export const decreaseMenuItemAvailability = (id, quantity) => {
  const item = getMenuItemById(id);
  if (item && item.available >= quantity) {
    item.available -= quantity;
    return true;
  }
  return false;
};

export const addOrder = (order) => {
  orders.push(order);
  return order;
};

export const getOrders = () => orders;

export const getOrderById = (id) => orders.find((order) => order.id === id);

export const updateOrderStatus = (id, status) => {
  const orderIndex = orders.findIndex((order) => order.id === id);
  if (orderIndex !== -1) {
    orders[orderIndex].status = status;
    return orders[orderIndex];
  }
  return null;
};

export const getCategories = () => [
  ...new Set(menuItems.map((item) => item.category)),
];

// User management functions
export const getUserById = (id) => users.find((user) => user.id === id);

export const getUserByEmail = (email) =>
  users.find((user) => user.email.toLowerCase() === email.toLowerCase());

export const createUser = (userData) => {
  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...userData,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  return newUser;
};

export const getUsers = () => users;

export const updateUser = (id, updateData) => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updateData };
    return users[userIndex];
  }
  return null;
};

export const deleteUser = (id) => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    const deletedUser = users.splice(userIndex, 1)[0];
    return deletedUser;
  }
  return null;
};
