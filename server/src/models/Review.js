import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Tham chiếu tới công thức thật trong collection recipes
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
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 500
        },

        status: {
            type: String,
            enum: ["pending", "approved", "hidden"],
            default: "pending"
        },

        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        moderatedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// Một tài khoản chỉ được có một nhận xét cho mỗi công thức
reviewSchema.index({ user: 1, recipe: 1 }, { unique: true });

// Tối ưu truy vấn nhận xét công khai của một công thức
reviewSchema.index({ recipe: 1, status: 1, createdAt: -1 });

// Admin lọc theo trạng thái
reviewSchema.index({ status: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
