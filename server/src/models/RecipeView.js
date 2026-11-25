import mongoose from "mongoose";

const recipeViewSchema = new mongoose.Schema({
    recipeKey: {
        type: String,
        required: true,
        trim: true
    },

    visitorId: {
        type: String,
        required: true
    },

    sessionId: {
        type: String,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30
    }
});

// Mỗi người dùng trong một phiên chỉ được tính một lần
recipeViewSchema.index(
    {
        recipeKey: 1,
        visitorId: 1,
        sessionId: 1
    },
    {
        unique: true
    }
);

const RecipeView = mongoose.model(
    "RecipeView",
    recipeViewSchema
);

export default RecipeView;