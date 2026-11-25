import { Router } from "express";

import {
    getRecipeViews,
    recordRecipeView
} from "../controllers/viewController.js";

const router = Router();

// Lấy tổng lượt xem
router.get("/:recipeKey", getRecipeViews);

// Ghi nhận lượt xem
router.post("/:recipeKey", recordRecipeView);

export default router;