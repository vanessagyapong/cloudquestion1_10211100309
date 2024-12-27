import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.model";
import Cart from "../models/cart.model";
import Wishlist from "../models/wishlist.model";

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    // Check if user already exists
    const existingUser = await User.findOne({ email: "admin@admin.com" });
    if (existingUser) {
      console.log("Test user already exists");
      process.exit(0);
    }

    // Create test user
    const user = await User.create({
      name: "Admin User",
      email: "admin@admin.com",
      password: await bcrypt.hash("iamadmin", 10),
      isActive: true,
      role: "admin",
      preferences: {
        language: "en",
        currency: "USD",
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
      },
    });

    // Create cart and wishlist
    await Promise.all([
      Cart.create({ user: user._id, items: [], total: 0 }),
      Wishlist.create({ user: user._id, products: [] }),
    ]);

    console.log("Test user created successfully:", {
      email: "admin@admin.com",
      password: "iamadmin",
    });
  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createTestUser();
