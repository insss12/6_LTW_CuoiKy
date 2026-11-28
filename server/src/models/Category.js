import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // Dạng không dấu, dùng cho URL/lọc (ví dụ "Món chính" -> "mon-chinh").
    // Database dùng chung đã có index unique trên slug nên trường này phải có giá trị.
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;