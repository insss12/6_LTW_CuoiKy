
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Dùng được cho cả công thức mẫu và công thức cộng đồng
        recipeKey: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
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
reviewSchema.index(
    {
        user: 1,
        recipeKey: 1
    },
    {
        unique: true
    }
);

// Tối ưu truy vấn nhận xét công khai
reviewSchema.index({
    recipeKey: 1,
    status: 1,
    createdAt: -1
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
