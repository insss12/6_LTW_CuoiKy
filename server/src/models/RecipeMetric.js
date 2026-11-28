import mongoose from "mongoose";

const recipeMetricSchema = new mongoose.Schema(
    {
        recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recipe",
            required: true,
            unique: true
        },

        viewCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

const RecipeMetric = mongoose.model("RecipeMetric", recipeMetricSchema);

export default RecipeMetric;
