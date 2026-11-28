import Favorite from "../models/Favorite.js";

import asyncHandler from "../utils/asyncHandler.js";
import { recipeKeyOf, resolveRecipe } from "../utils/recipeRef.js";

// Món yêu thích ("thả tim"). Thay thế likeController và collection RecipeLike cũ.
// Tên trường trong JSON (liked, likeCount) giữ nguyên để client hiện tại vẫn chạy.

const countFor = (recipeId) => Favorite.countDocuments({ recipe: recipeId });

// GET /api/favorites/:recipeKey
// Số lượt thích công khai
export const getFavoriteCount = asyncHandler(async (req, res) => {
    const recipe = await resolveRecipe(req.params.recipeKey);

    res.status(200).json({
        success: true,
        recipeKey: recipeKeyOf(recipe),
        likeCount: await countFor(recipe._id)
    });
});

// GET /api/favorites/:recipeKey/me
// Người dùng hiện tại đã thích chưa
export const getMyFavoriteStatus = asyncHandler(async (req, res) => {
    const recipe = await resolveRecipe(req.params.recipeKey);

    const [liked, likeCount] = await Promise.all([
        Favorite.exists({ user: req.user._id, recipe: recipe._id }),
        countFor(recipe._id)
    ]);

    res.status(200).json({
        success: true,
        liked: Boolean(liked),
        likeCount
    });
});

// PUT /api/favorites/:recipeKey
// Thêm vào yêu thích
export const addFavorite = asyncHandler(async (req, res) => {
    const recipe = await resolveRecipe(req.params.recipeKey);

    let created = false;

    try {
        await Favorite.create({
            user: req.user._id,
            recipe: recipe._id
        });

        created = true;
    } catch (error) {
        // Đã thích rồi (unique index user + recipe) thì không tạo bản ghi trùng
        if (error.code !== 11000) {
            throw error;
        }
    }

    res.status(created ? 201 : 200).json({
        success: true,
        liked: true,
        created,
        likeCount: await countFor(recipe._id),
        message: created
            ? "Đã thích công thức"
            : "Bạn đã thích công thức này rồi"
    });
});

// DELETE /api/favorites/:recipeKey
// Bỏ yêu thích (cho phép cả khi công thức đã bị ẩn)
export const removeFavorite = asyncHandler(async (req, res) => {
    const recipe = await resolveRecipe(req.params.recipeKey, {
        onlyApproved: false
    });

    const result = await Favorite.deleteOne({
        user: req.user._id,
        recipe: recipe._id
    });

    res.status(200).json({
        success: true,
        liked: false,
        removed: result.deletedCount > 0,
        likeCount: await countFor(recipe._id),
        message: result.deletedCount > 0
            ? "Đã bỏ thích công thức"
            : "Bạn chưa thích công thức này"
    });
});

// GET /api/favorites/mine
// Danh sách công thức đã thích của tài khoản, mới nhất trước.
// Chỉ gồm công thức còn tồn tại và đã được duyệt.
export const getMyFavorites = asyncHandler(async (req, res) => {
    const favorites = await Favorite.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate({
            path: "recipe",
            match: { status: "approved" },
            select: "legacyKey"
        })
        .lean();

    const items = favorites
        .filter((favorite) => favorite.recipe)
        .map((favorite) => recipeKeyOf(favorite.recipe));

    res.status(200).json({
        success: true,
        count: items.length,
        items
    });
});
