
import { Router } from "express";

import {
    getPublicReviews,
    getMyReview,
    saveReview,
    deleteMyReview
} from "../controllers/reviewController.js";

import { protect } from "../middleware/auth.js";

const router = Router();

// Nhận xét đã được duyệt - công khai
router.get("/:recipeKey", getPublicReviews);

// Nhận xét của tài khoản hiện tại
router.get("/:recipeKey/mine", protect, getMyReview);

// Gửi hoặc cập nhật nhận xét
router.post("/:recipeKey", protect, saveReview);

// Xóa nhận xét của chính mình
router.delete("/:recipeKey", protect, deleteMyReview);

export default router;
