"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert users
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          email: "admin@canteen.com",
          password:
            "$2a$10$kStC1DLmns/Y.HYZi6mL/.APust2q3o6njMNh7Uxa6eMWnJEDDVzW", // password: admin123
          name: "Admin User",
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          email: "customer@example.com",
          password:
            "$2a$10$CQOJP6d4DDVI8DGkze/aQOFdyMCZDaLeq158E3c5aeg6cgwsRg97G", // password: customer123
          name: "John Doe",
          role: "customer",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Insert menu items
    await queryInterface.bulkInsert(
      "MenuItems",
      [
        {
          name: "Veg Thali",
          price: 120.0,
          category: "Main Course",
          available: 25,
          image:
            "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Chicken Biryani",
          price: 180.0,
          category: "Main Course",
          available: 15,
          image:
            "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=300&h=200&fit=crop",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Masala Dosa",
          price: 80.0,
          category: "South Indian",
          available: 30,
          image:
            "https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&h=200&fit=crop",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Paneer Butter Masala",
          price: 150.0,
          category: "Main Course",
          available: 20,
          image:
            "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&h=200&fit=crop",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Samosa (2 pcs)",
          price: 40.0,
          category: "Snacks",
          available: 50,
          image:
            "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd9?w=300&h=200&fit=crop",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Mango Lassi",
          price: 60.0,
          category: "Beverages",
          available: 40,
          image:
            "https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=300&h=200&fit=crop",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Chole Bhature",
          price: 110.0,
          category: "North Indian",
          available: 18,
          image:
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Filter Coffee",
          price: 25.0,
          category: "Beverages",
          available: 60,
          image:
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("MenuItems", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
