
import { Router } from "express";

import {
    getLikeCount,
    getMyLikeStatus,
    addLike,
    removeLike,
    getMyLikedRecipes
} from "../controllers/likeController.js";

import { protect } from "../middleware/auth.js";

const router = Router();

// Đặt /mine trước các route động
router.get("/mine", protect, getMyLikedRecipes);

// Xem số tim công khai
router.get("/:recipeKey", getLikeCount);

// Kiểm tra trạng thái tim của tài khoản
router.get("/:recipeKey/me", protect, getMyLikeStatus);

// Thả tim
router.put("/:recipeKey", protect, addLike);

// Bỏ tim
router.delete("/:recipeKey", protect, removeLike);

export default router;
