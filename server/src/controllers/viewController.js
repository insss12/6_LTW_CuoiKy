import RecipeMetric from "../models/RecipeMetric.js";
import RecipeView from "../models/RecipeView.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Kiểm tra mã công thức
function validateRecipeKey(recipeKey) {
    if (
        typeof recipeKey !== "string" ||
        recipeKey.trim().length < 1 ||
        recipeKey.trim().length > 120 ||
        !/^[a-zA-Z0-9_-]+$/.test(recipeKey.trim())
    ) {
        throw ApiError.badRequest("Mã công thức không hợp lệ");
    }

    return recipeKey.trim();
}

// GET /api/views/:recipeKey
// Lấy số lượt xem
export const getRecipeViews = asyncHandler(async (req, res) => {
    const recipeKey = validateRecipeKey(req.params.recipeKey);

    const metric = await RecipeMetric.findOne({
        recipeKey
    }).lean();

    res.status(200).json({
        success: true,
        recipeKey,
        viewCount: metric?.viewCount || 0
    });
});

// POST /api/views/:recipeKey
// Ghi nhận một lượt xem
export const recordRecipeView = asyncHandler(async (req, res) => {
    const recipeKey = validateRecipeKey(req.params.recipeKey);

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
            recipeKey,
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
                { recipeKey },
                {
                    $setOnInsert: {
                        recipeKey
                    },
                    $inc: {
                        viewCount: 1
                    }
                },
                {
                    upsert: true
                }
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
        recipeKey
    }).lean();

    res.status(200).json({
        success: true,
        counted: Boolean(newView),
        viewCount: metric?.viewCount || 0
    });
});