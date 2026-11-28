import { Router } from "express";

import {
  listRecipes,
  getMyRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe
} from "../controllers/recipeController.js";

import { protect, optionalAuth } from "../middleware/auth.js";

const router = Router();

// Danh sách công khai (chỉ món đã duyệt), có lọc và phân trang
router.get("/", listRecipes);

// Đặt /mine trước /:id để không bị hiểu nhầm "mine" là một id
router.get("/mine", protect, getMyRecipes);

// Chi tiết: khách xem được món đã duyệt; chủ sở hữu/Admin xem được cả món chưa duyệt
router.get("/:id", optionalAuth, getRecipe);

router.post("/", protect, createRecipe);
router.put("/:id", protect, updateRecipe);
router.delete("/:id", protect, deleteRecipe);

export default router;
