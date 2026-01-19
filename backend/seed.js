// backend/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import User from "./models/User.js";
import connectDB from "./config/db.js";
import fetch from "node-fetch";

dotenv.config();
await connectDB();

const dummyDataURL = "https://dummyjson.com/products?limit=100";

try {
  // Clean old data
  await Product.deleteMany();
  await User.deleteMany();
  console.log("🗑️ Old products & users removed");

  // Create an admin user
  const adminUser = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "123456", // ✅ gets hashed by User model
    isAdmin: true,
  });

  console.log("👤 Admin user created:", adminUser.email);

  // Fetch products from DummyJSON
  const res = await fetch(dummyDataURL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
  const data = await res.json();

  if (!Array.isArray(data.products)) {
    throw new Error("DummyJSON response does not contain products array");
  }

  // Map API → Product model
  const products = data.products.map((item) => ({
    title: item.title,
    description: item.description || "",
    price: item.price || 0,
    category: item.category || "general",
    image: item.thumbnail || (item.images?.[0] ?? ""),
    stock: item.stock ?? 0,
    createdBy: adminUser._id,
  }));

  await Product.insertMany(products);

  console.log(`✅ Seeded ${products.length} products from DummyJSON!`);
  process.exit();
} catch (err) {
  console.error("❌ Seeding error:", err);
  process.exit(1);
}
