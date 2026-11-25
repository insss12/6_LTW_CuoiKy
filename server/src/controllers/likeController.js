
import RecipeLike from "../models/RecipeLike.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Kiểm tra ID công thức
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

// GET /api/likes/:recipeKey
// Lấy tổng số lượt thích
export const getLikeCount = asyncHandler(async (req, res) => {
    const recipeKey = validateRecipeKey(req.params.recipeKey);

    const likeCount = await RecipeLike.countDocuments({
        recipeKey
    });

    res.status(200).json({
        success: true,
        recipeKey,
        likeCount
    });
});

// GET /api/likes/:recipeKey/me
// Kiểm tra người dùng hiện tại đã thích chưa
export const getMyLikeStatus = asyncHandler(async (req, res) => {
    const recipeKey = validateRecipeKey(req.params.recipeKey);

    const liked = await RecipeLike.exists({
        user: req.user._id,
        recipeKey
    });

    const likeCount = await RecipeLike.countDocuments({
        recipeKey
    });

    res.status(200).json({
        success: true,
        liked: Boolean(liked),
        likeCount
    });
});

// PUT /api/likes/:recipeKey
// Thêm lượt thích
export const addLike = asyncHandler(async (req, res) => {
    const recipeKey = validateRecipeKey(req.params.recipeKey);

    let created = false;

    try {
        await RecipeLike.create({
            user: req.user._id,
            recipeKey
        });

        created = true;
    } catch (error) {
        // Nếu đã thích rồi thì không tạo bản ghi trùng
        if (error.code !== 11000) {
            throw error;
        }
    }

    const likeCount = await RecipeLike.countDocuments({
        recipeKey
    });

    res.status(created ? 201 : 200).json({
        success: true,
        liked: true,
        created,
        likeCount,
        message: created
            ? "Đã thích công thức"
            : "Bạn đã thích công thức này rồi"
    });
});

// DELETE /api/likes/:recipeKey
// Bỏ lượt thích
export const removeLike = asyncHandler(async (req, res) => {
    const recipeKey = validateRecipeKey(req.params.recipeKey);

    const result = await RecipeLike.deleteOne({
        user: req.user._id,
        recipeKey
    });

    const likeCount = await RecipeLike.countDocuments({
        recipeKey
    });

    res.status(200).json({
        success: true,
        liked: false,
        removed: result.deletedCount > 0,
        likeCount,
        message: result.deletedCount > 0
            ? "Đã bỏ thích công thức"
            : "Bạn chưa thích công thức này"
    });
});

// GET /api/likes/mine
// Lấy danh sách công thức đã thích của tài khoản
export const getMyLikedRecipes = asyncHandler(async (req, res) => {
    const likes = await RecipeLike.find({
        user: req.user._id
    })
        .sort({ createdAt: -1 })
        .select("recipeKey createdAt")
        .lean();

    res.status(200).json({
        success: true,
        count: likes.length,
        items: likes.map((item) => item.recipeKey)
    });
});
