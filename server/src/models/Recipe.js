import mongoose from "mongoose";

import { DIFFICULTIES } from "../utils/recipeValidation.js";

// Nguyên liệu và bước làm nhúng thẳng trong Recipe (luôn đọc cùng công thức,
// không cần truy vấn riêng) nên dùng document lồng nhau, không tách collection.
const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    // null nghĩa là "vừa đủ"/không có số lượng cụ thể
    quantity: { type: Number, min: 0, default: null },
    unit: { type: String, trim: true, maxlength: 30, default: "" }
  },
  { _id: false }
);

const stepSchema = new mongoose.Schema(
  {
    stepNumber: { type: Number, required: true, min: 1 },
    instruction: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { _id: false }
);

const notEmpty = {
  validator: (value) => Array.isArray(value) && value.length > 0,
  message: "Danh sách không được để trống"
};

const recipeSchema = new mongoose.Schema(
  {
    // Mã cũ của công thức mẫu (mau-1, mau-2...) để chuyển review/like/view cũ
    // sang _id mới ở bước sau. Công thức do người dùng đăng thì không có.
    legacyKey: { type: String, trim: true, unique: true, sparse: true },

    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    // Tên món đã bỏ dấu, viết thường: dùng cho ô tìm kiếm theo tên
    titleKey: { type: String, required: true },

    description: { type: String, trim: true, maxlength: 1000, default: "" },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

    image: { type: String, trim: true, maxlength: 500, default: "" },

    prepTime: { type: Number, min: 0, max: 1440, default: 0 },
    cookingTime: { type: Number, min: 0, max: 1440, default: 0 },
    // = prepTime + cookingTime, lưu sẵn để lọc theo thời gian ($lte) và sắp xếp
    totalTime: { type: Number, required: true, min: 1, max: 2880 },

    difficulty: { type: String, enum: DIFFICULTIES, default: DIFFICULTIES[0] },
    servings: { type: Number, required: true, min: 1, max: 50 },

    ingredients: { type: [ingredientSchema], validate: notEmpty },
    // Tên nguyên liệu đã bỏ dấu, viết thường: dùng cho tìm theo nguyên liệu ($in)
    ingredientKeys: { type: [String], default: [] },

    steps: { type: [stepSchema], validate: notEmpty },

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // pending: chờ Admin duyệt | approved: hiển thị công khai | rejected: bị từ chối
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    rejectionReason: { type: String, trim: true, maxlength: 300, default: "" },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    moderatedAt: { type: Date, default: null },

    // Điểm trung bình và số lượt đánh giá, cập nhật khi review thay đổi (bước sau)
    ratingAvg: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 }
  },
  { timestamps: true }
);

// Danh sách công khai: lọc theo trạng thái, mới nhất trước
recipeSchema.index({ status: 1, createdAt: -1 });
// Tìm theo nguyên liệu, theo tên, theo loại món, theo tác giả
recipeSchema.index({ ingredientKeys: 1 });
recipeSchema.index({ titleKey: 1 });
recipeSchema.index({ category: 1, status: 1 });
recipeSchema.index({ author: 1, createdAt: -1 });

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
