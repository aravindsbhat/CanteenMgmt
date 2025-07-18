import bcrypt from "bcryptjs";

// Generate hashed passwords for default users
const generateHashedPasswords = async () => {
  const saltRounds = 10;

  const adminPassword = await bcrypt.hash("admin123", saltRounds);
  const customerPassword = await bcrypt.hash("customer123", saltRounds);

  console.log("Admin password hash (admin123):", adminPassword);
  console.log("Customer password hash (customer123):", customerPassword);

  console.log("\nDefault Login Credentials:");
  console.log("Admin: admin@canteen.com / admin123");
  console.log("Customer: customer@example.com / customer123");
};

generateHashedPasswords().catch(console.error);
