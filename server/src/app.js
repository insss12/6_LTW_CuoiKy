import "dotenv/config";

import express from "express";
import cors from "cors";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import viewRoutes from "./routes/viewRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminReviewRoutes from "./routes/adminReviewRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import adminRecipeRoutes from "./routes/adminRecipeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

const allowedOrigin =
    process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
    origin: allowedOrigin
}));

app.use(express.json({
    limit: "2mb"
}));

app.use(express.urlencoded({
    extended: true
}));

// API kiểm tra Server
app.use("/api/health", healthRoutes);

// API đăng nhập, đăng ký
app.use("/api/auth", authRoutes);

// API lượt xem
app.use("/api/views", viewRoutes);

app.use("/api/likes", likeRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/admin/reviews", adminReviewRoutes);
// API công thức, loại món
app.use("/api/recipes", recipeRoutes);
app.use("/api/categories", categoryRoutes);

// API kiểm duyệt công thức (Admin)
app.use("/api/admin/recipes", adminRecipeRoutes);

// Xử lý lỗi
app.use(notFound);
app.use(errorHandler);

export default app; 