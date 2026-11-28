import { Router } from "express";

import {
  getAdminRecipes,
  approveRecipe,
  rejectRecipe
} from "../controllers/recipeController.js";

import { protect, requireRole } from "../middleware/auth.js";

const router = Router();

// Tất cả API dưới đây yêu cầu quyền Admin
router.use(protect, requireRole("admin"));

// Danh sách công thức theo trạng thái (mặc định: chờ duyệt)
router.get("/", getAdminRecipes);

router.patch("/:id/approve", approveRecipe);
router.patch("/:id/reject", rejectRecipe);

export default router;
