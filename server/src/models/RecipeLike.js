
import mongoose from "mongoose";

const recipeLikeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        recipeKey: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        }
    },
    {
        timestamps: true
    }
);

// Một người dùng chỉ được thích một lần cho mỗi công thức
recipeLikeSchema.index(
    {
        user: 1,
        recipeKey: 1
    },
    {
        unique: true
    }
);

const RecipeLike = mongoose.model(
    "RecipeLike",
    recipeLikeSchema
);

export default RecipeLike;
