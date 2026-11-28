import RecipeMetric from "../models/RecipeMetric.js";
import RecipeView from "../models/RecipeView.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { recipeKeyOf, resolveRecipe } from "../utils/recipeRef.js";

// GET /api/views/:recipeKey
// Lấy số lượt xem
export const getRecipeViews = asyncHandler(async (req, res) => {
    const recipe = await resolveRecipe(req.params.recipeKey);

    const metric = await RecipeMetric.findOne({
        recipe: recipe._id
    }).lean();

    res.status(200).json({
        success: true,
        recipeKey: recipeKeyOf(recipe),
        viewCount: metric?.viewCount || 0
    });
});

// POST /api/views/:recipeKey
// Ghi nhận một lượt xem
export const recordRecipeView = asyncHandler(async (req, res) => {
    const recipe = await resolveRecipe(req.params.recipeKey);

    const { visitorId, sessionId } = req.body || {};

    if (
        typeof visitorId !== "string" ||
        visitorId.length < 8 ||
        visitorId.length > 100 ||
        typeof sessionId !== "string" ||
        sessionId.length < 8 ||
        sessionId.length > 100
    ) {
        throw ApiError.badRequest(
            "Thông tin phiên xem không hợp lệ"
        );
    }

    let newView = null;

    try {
        // Thử tạo bản ghi lượt xem
        newView = await RecipeView.create({
            recipe: recipe._id,
            visitorId,
            sessionId
        });
    } catch (error) {
        // Nếu đã xem trong phiên này thì không tăng nữa
        if (error.code !== 11000) {
            throw error;
        }
    }

    // Chỉ tăng số lượt xem khi tạo được bản ghi mới
    if (newView) {
        try {
            await RecipeMetric.updateOne(
                { recipe: recipe._id },
                { $inc: { viewCount: 1 } },
                { upsert: true }
            );
        } catch (error) {
            // Nếu tăng bộ đếm thất bại, xóa bản ghi
            // để request sau có thể thử lại
            await RecipeView.deleteOne({
                _id: newView._id
            });

            throw error;
        }
    }

    const metric = await RecipeMetric.findOne({
        recipe: recipe._id
    }).lean();

    res.status(200).json({
        success: true,
        counted: Boolean(newView),
        viewCount: metric?.viewCount || 0
    });
});
