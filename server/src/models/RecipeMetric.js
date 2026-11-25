import mongoose from "mongoose";

const recipeMetricSchema = new mongoose.Schema(
    {
        recipeKey: {
            type: String,
            required: true,
            trim: true,
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

const RecipeMetric = mongoose.model(
    "RecipeMetric",
    recipeMetricSchema
);

export default RecipeMetric;    