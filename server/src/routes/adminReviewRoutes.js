
import { Router } from "express";

import {
    getAdminReviews,
    approveReview,
    hideReview,
    deleteReviewByAdmin
} from "../controllers/reviewController.js";

import {
    protect,
    requireRole
} from "../middleware/auth.js";

const router = Router();

// Tất cả API dưới đây đều yêu cầu quyền Admin
router.use(protect, requireRole("admin"));

// Danh sách chờ duyệt, đã duyệt hoặc đã ẩn
router.get("/", getAdminReviews);

// Duyệt nhận xét
router.patch("/:id/approve", approveReview);

// Ẩn nhận xét
router.patch("/:id/hide", hideReview);

// Xóa nhận xét vi phạm
router.delete("/:id", deleteReviewByAdmin);

export default router;
