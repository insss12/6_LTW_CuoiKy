import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      default: "",
      trim: true
    },

    isHidden: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Chặn một người đánh giá cùng món nhiều lần
reviewSchema.index(
  { user: 1, recipe: 1 },
  { unique: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;