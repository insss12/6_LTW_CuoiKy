import mongoose from "mongoose";

// Món yêu thích ("thả tim"). Thay thế collection RecipeLike cũ.
const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Không cho lưu trùng món yêu thích
favoriteSchema.index({ user: 1, recipe: 1 }, { unique: true });

// Đếm số lượt thích của một công thức
favoriteSchema.index({ recipe: 1 });

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;
