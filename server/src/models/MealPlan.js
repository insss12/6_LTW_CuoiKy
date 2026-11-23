import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    weekStart: {
      type: Date,
      required: true
    },

    meals: [
      {
        date: {
          type: Date,
          required: true
        },

        mealType: {
          type: String,
          enum: ["breakfast", "lunch", "dinner"],
          required: true
        },

        recipe: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Recipe",
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Mỗi người chỉ có một thực đơn cho một tuần
mealPlanSchema.index(
  { user: 1, weekStart: 1 },
  { unique: true }
);

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);

export default MealPlan;