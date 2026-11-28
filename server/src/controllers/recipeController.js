import Category from "../models/Category.js";
import Recipe from "../models/Recipe.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { escapeRegex, normalizeText } from "../utils/text.js";
import {
  DIFFICULTIES,
  isObjectId,
  validateRecipeInput
} from "../utils/recipeValidation.js";

const STATUSES = ["pending", "approved", "rejected"];

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  quickest: { totalTime: 1, _id: -1 },
  rating: { ratingAvg: -1, ratingCount: -1, _id: -1 }
};

// Giá trị trên query string có thể là mảng/object (?q[$ne]=x): chỉ nhận chuỗi
// để chặn NoSQL injection.
const queryString = (value) => (typeof value === "string" ? value.trim() : "");

const parsePaging = (query, defaultLimit = 12) => {
  const page = Math.max(1, parseInt(queryString(query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(queryString(query.limit), 10) || defaultLimit));

  return { page, limit, skip: (page - 1) * limit };
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit)
});

const refId = (value) => (value ? String(value._id ?? value) : null);

// Chỉ trả những trường cần thiết, không lộ titleKey/ingredientKeys
const formatRecipe = (recipe, { detail = true } = {}) => ({
  id: String(recipe._id),
  title: recipe.title,
  description: recipe.description,
  image: recipe.image,
  category: recipe.category
    ? { id: refId(recipe.category), name: recipe.category.name || "" }
    : null,
  author: {
    id: refId(recipe.author),
    name: recipe.author?.name || "Thành viên Bếp Nhà"
  },
  prepTime: recipe.prepTime,
  cookingTime: recipe.cookingTime,
  totalTime: recipe.totalTime,
  difficulty: recipe.difficulty,
  servings: recipe.servings,
  ingredients: recipe.ingredients.map(({ name, quantity, unit }) => ({ name, quantity, unit })),
  ...(detail && {
    steps: recipe.steps.map(({ stepNumber, instruction }) => ({ stepNumber, instruction }))
  }),
  status: recipe.status,
  rejectionReason: recipe.rejectionReason,
  ratingAvg: recipe.ratingAvg,
  ratingCount: recipe.ratingCount,
  createdAt: recipe.createdAt,
  updatedAt: recipe.updatedAt
});

const isAdmin = (user) => user?.role === "admin";
const isOwner = (user, recipe) =>
  Boolean(user) && String(refId(recipe.author)) === String(user._id);
const canManage = (user, recipe) => isAdmin(user) || isOwner(user, recipe);

const loadRecipe = async (id) => {
  if (!isObjectId(String(id))) {
    throw ApiError.notFound("Không tìm thấy công thức");
  }

  const recipe = await Recipe.findById(id)
    .populate("author", "name")
    .populate("category", "name");

  if (!recipe) {
    throw ApiError.notFound("Không tìm thấy công thức");
  }

  return recipe;
};

const ensureCategory = async (categoryId) => {
  const exists = await Category.exists({ _id: categoryId, isActive: true });

  if (!exists) {
    throw ApiError.badRequest("Dữ liệu không hợp lệ", [
      { field: "category", message: "Loại món không tồn tại" }
    ]);
  }
};

const validateOrThrow = async (body) => {
  const { errors, value } = validateRecipeInput(body);

  if (errors.length > 0) {
    throw ApiError.badRequest("Dữ liệu không hợp lệ", errors);
  }

  await ensureCategory(value.category);

  return value;
};

const populateRecipe = (recipe) =>
  recipe.populate([
    { path: "author", select: "name" },
    { path: "category", select: "name" }
  ]);

// GET /api/recipes?q=&category=&difficulty=&maxTime=&sort=&page=&limit=
// Công khai: chỉ trả công thức đã được duyệt.
export const listRecipes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query);
  const filter = { status: "approved" };

  // Tên món: bỏ dấu + không phân biệt hoa thường
  const keyword = normalizeText(queryString(req.query.q));
  if (keyword) {
    filter.titleKey = { $regex: escapeRegex(keyword) };
  }

  const category = queryString(req.query.category);
  if (category) {
    if (!isObjectId(category)) {
      throw ApiError.badRequest("Loại món không hợp lệ");
    }
    filter.category = category;
  }

  const difficulty = queryString(req.query.difficulty);
  if (difficulty) {
    if (!DIFFICULTIES.includes(difficulty)) {
      throw ApiError.badRequest(`Độ khó phải là một trong: ${DIFFICULTIES.join(", ")}`);
    }
    filter.difficulty = difficulty;
  }

  const maxTime = queryString(req.query.maxTime);
  if (maxTime) {
    if (!/^\d+$/.test(maxTime) || Number(maxTime) < 1) {
      throw ApiError.badRequest("Thời gian tối đa phải là số nguyên dương (phút)");
    }
    filter.totalTime = { $lte: Number(maxTime) };
  }

  const sortKey = queryString(req.query.sort) || "newest";
  if (!SORTS[sortKey]) {
    throw ApiError.badRequest(`Kiểu sắp xếp phải là một trong: ${Object.keys(SORTS).join(", ")}`);
  }

  const [recipes, total] = await Promise.all([
    Recipe.find(filter)
      .populate("author", "name")
      .populate("category", "name")
      .sort(SORTS[sortKey])
      .skip(skip)
      .limit(limit)
      .lean(),
    Recipe.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    items: recipes.map((recipe) => formatRecipe(recipe, { detail: false })),
    pagination: buildPagination(page, limit, total)
  });
});

// GET /api/recipes/mine?status=  (cần đăng nhập)
// Công thức của chính mình ở mọi trạng thái.
export const getMyRecipes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePaging(req.query, 20);
  const filter = { author: req.user._id };

  const status = queryString(req.query.status);
  if (status) {
    if (!STATUSES.includes(status)) {
      throw ApiError.badRequest("Trạng thái không hợp lệ");
    }
    filter.status = status;
  }

  const [recipes, total] = await Promise.all([
    Recipe.find(filter)
      .populate("author", "name")
      .populate("category", "name")
      .sort(SORTS.newest)
      .skip(skip)
      .limit(limit)
      .lean(),
    Recipe.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    items: recipes.map((recipe) => formatRecipe(recipe, { detail: false })),
    pagination: buildPagination(page, limit, total)
  });
});

// GET /api/recipes/:id
// Công thức chưa duyệt chỉ chủ sở hữu hoặc Admin xem được (người khác nhận 404).
export const getRecipe = asyncHandler(async (req, res) => {
  const recipe = await loadRecipe(req.params.id);

  if (recipe.status !== "approved" && !canManage(req.user, recipe)) {
    throw ApiError.notFound("Không tìm thấy công thức");
  }

  res.status(200).json({ success: true, recipe: formatRecipe(recipe) });
});

// POST /api/recipes
// Thành viên đăng thì chờ duyệt, Admin đăng thì hiển thị luôn.
export const createRecipe = asyncHandler(async (req, res) => {
  const value = await validateOrThrow(req.body);
  const approvedNow = isAdmin(req.user);

  const recipe = await Recipe.create({
    ...value,
    author: req.user._id,
    status: approvedNow ? "approved" : "pending",
    moderatedBy: approvedNow ? req.user._id : null,
    moderatedAt: approvedNow ? new Date() : null
  });

  await populateRecipe(recipe);

  res.status(201).json({
    success: true,
    message: approvedNow
      ? "Đã đăng công thức"
      : "Công thức đã gửi và đang chờ Admin duyệt",
    recipe: formatRecipe(recipe)
  });
});

// PUT /api/recipes/:id  (chủ sở hữu hoặc Admin)
export const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await loadRecipe(req.params.id);

  if (!canManage(req.user, recipe)) {
    // Công thức chưa duyệt thì không tiết lộ là có tồn tại
    throw recipe.status === "approved"
      ? ApiError.forbidden("Bạn chỉ được sửa công thức của mình")
      : ApiError.notFound("Không tìm thấy công thức");
  }

  const value = await validateOrThrow(req.body);

  recipe.set(value);

  // Thành viên sửa xong phải được duyệt lại, tránh đăng bản sạch rồi sửa nội dung vi phạm.
  // Admin sửa thì giữ nguyên trạng thái.
  if (!isAdmin(req.user)) {
    recipe.status = "pending";
    recipe.rejectionReason = "";
    recipe.moderatedBy = null;
    recipe.moderatedAt = null;
  }

  await recipe.save();
  await populateRecipe(recipe);

  res.status(200).json({
    success: true,
    message: isAdmin(req.user)
      ? "Đã cập nhật công thức"
      : "Đã cập nhật, công thức đang chờ Admin duyệt lại",
    recipe: formatRecipe(recipe)
  });
});

// DELETE /api/recipes/:id  (chủ sở hữu hoặc Admin)
export const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await loadRecipe(req.params.id);

  if (!canManage(req.user, recipe)) {
    throw recipe.status === "approved"
      ? ApiError.forbidden("Bạn chỉ được xóa công thức của mình")
      : ApiError.notFound("Không tìm thấy công thức");
  }

  await recipe.deleteOne();

  res.status(200).json({ success: true, message: "Đã xóa công thức" });
});

// ---------------- Admin ----------------

// GET /api/admin/recipes?status=pending&page=&limit=
export const getAdminRecipes = asyncHandler(async (req, res) => {
  const status = queryString(req.query.status) || "pending";

  if (!STATUSES.includes(status)) {
    throw ApiError.badRequest("Trạng thái kiểm duyệt không hợp lệ");
  }

  const { page, limit, skip } = parsePaging(req.query, 20);
  const filter = { status };

  const [recipes, total] = await Promise.all([
    Recipe.find(filter)
      .populate("author", "name")
      .populate("category", "name")
      .sort(SORTS.oldest)
      .skip(skip)
      .limit(limit)
      .lean(),
    Recipe.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    items: recipes.map((recipe) => formatRecipe(recipe, { detail: false })),
    pagination: buildPagination(page, limit, total)
  });
});

const moderate = async (req, status, reason = "") => {
  const recipe = await loadRecipe(req.params.id);

  recipe.status = status;
  recipe.rejectionReason = reason;
  recipe.moderatedBy = req.user._id;
  recipe.moderatedAt = new Date();

  await recipe.save();

  return recipe;
};

// PATCH /api/admin/recipes/:id/approve
export const approveRecipe = asyncHandler(async (req, res) => {
  const recipe = await moderate(req, "approved");

  res.status(200).json({
    success: true,
    message: "Đã duyệt công thức",
    recipe: formatRecipe(recipe)
  });
});

// PATCH /api/admin/recipes/:id/reject   body: { reason }
export const rejectRecipe = asyncHandler(async (req, res) => {
  const reason = queryString(req.body?.reason);

  if (reason.length > 300) {
    throw ApiError.badRequest("Lý do từ chối tối đa 300 ký tự");
  }

  const recipe = await moderate(req, "rejected", reason);

  res.status(200).json({
    success: true,
    message: "Đã từ chối công thức",
    recipe: formatRecipe(recipe)
  });
});
