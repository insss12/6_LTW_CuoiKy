import { Router } from "express";

import {
    getFavoriteCount,
    getMyFavoriteStatus,
    addFavorite,
    removeFavorite,
    getMyFavorites
} from "../controllers/favoriteController.js";

import { protect } from "../middleware/auth.js";

const router = Router();

// Đặt /mine trước các route động
router.get("/mine", protect, getMyFavorites);

// Số lượt thích công khai
router.get("/:recipeKey", getFavoriteCount);

// Trạng thái yêu thích của tài khoản
router.get("/:recipeKey/me", protect, getMyFavoriteStatus);

// Thêm / bỏ yêu thích
router.put("/:recipeKey", protect, addFavorite);
router.delete("/:recipeKey", protect, removeFavorite);

export default router;
