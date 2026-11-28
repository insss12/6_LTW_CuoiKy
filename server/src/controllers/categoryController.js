import Category from "../models/Category.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/categories
// Công khai: danh sách loại món đang dùng, để đổ vào bộ lọc và form đăng công thức.
export const listCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ name: 1 })
    .lean();

  res.status(200).json({
    success: true,
    items: categories.map(({ _id, name, description }) => ({
      id: String(_id),
      name,
      description
    }))
  });
});
