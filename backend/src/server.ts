import dotenv from "dotenv";

// Load environment variables before any other imports
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import userRoutes from "./routes/user.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import cartRoutes from "./routes/cart.routes";
import storeRoutes from "./routes/store.routes";

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Response interceptor middleware
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    // Log non-200 responses
    if (res.statusCode !== 200 && res.statusCode !== 201) {
      console.log(
        "\x1b[31m%s\x1b[0m",
        `[${res.statusCode}] ${req.method} ${req.originalUrl}`
      );
      if (body.message) {
        console.log("\x1b[33m%s\x1b[0m", `Message: ${body.message}`);
      }
      if (body.error && process.env.NODE_ENV === "development") {
        console.log("\x1b[33m%s\x1b[0m", `Error: ${body.error}`);
      }
      console.log(); // Empty line for readability
    }
    return originalJson.call(this, body);
  };
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/store", storeRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong!";
    const error =
      process.env.NODE_ENV === "development" ? err.stack : undefined;

    // Log error with color coding
    console.log(
      "\x1b[31m%s\x1b[0m",
      `[${statusCode}] ${req.method} ${req.originalUrl}`
    );
    console.log("\x1b[33m%s\x1b[0m", `Message: ${message}`);
    if (error) {
      console.log("\x1b[33m%s\x1b[0m", `Stack: ${error}`);
    }
    console.log(); // Empty line for readability

    res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  }
);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌍 Server is running on port ${PORT}`);
  console.log(
    `Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
});
