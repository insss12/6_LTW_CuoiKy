import { apiRequest } from "./api";

// Đổi dữ liệu server trả về sang dạng giao diện đang dùng:
// category -> tên loại món (kèm categoryId), author -> tên tác giả (kèm authorId),
// totalTime -> time (phút).
export const mapRecipe = (recipe) => ({
  ...recipe,
  categoryId: recipe.category?.id || "",
  category: recipe.category?.name || "",
  authorId: recipe.author?.id || "",
  author: recipe.author?.name || "Thành viên Bếp Nhà",
  time: recipe.totalTime
});

// Chỉ gắn tham số có giá trị vào query string
const toQueryString = (params) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const text = search.toString();

  return text ? `?${text}` : "";
};

const mapList = (data) => ({
  items: (data.items || []).map(mapRecipe),
  pagination: data.pagination || { page: 1, limit: 0, total: 0, totalPages: 0 }
});

// GET /api/recipes (công khai, chỉ món đã duyệt)
export const fetchRecipes = async (params = {}) =>
  mapList(await apiRequest(`/recipes${toQueryString(params)}`));

// GET /api/recipes/mine (cần đăng nhập)
export const fetchMyRecipes = async (token, params = {}) =>
  mapList(await apiRequest(`/recipes/mine${toQueryString(params)}`, { token }));

// GET /api/recipes/:id (token không bắt buộc: chủ món/Admin xem được món chưa duyệt)
export const fetchRecipe = async (id, token) => {
  const data = await apiRequest(`/recipes/${encodeURIComponent(id)}`, { token });

  return mapRecipe(data.recipe);
};

export const createRecipe = (token, body) =>
  apiRequest("/recipes", { method: "POST", token, body });

export const updateRecipe = (token, id, body) =>
  apiRequest(`/recipes/${encodeURIComponent(id)}`, { method: "PUT", token, body });

export const deleteRecipe = (token, id) =>
  apiRequest(`/recipes/${encodeURIComponent(id)}`, { method: "DELETE", token });

// GET /api/categories
export const fetchCategories = async () => {
  const data = await apiRequest("/categories");

  return data.items || [];
};

// Nhãn và màu trạng thái kiểm duyệt (dùng ở "Công thức của tôi" và trang chi tiết)
export const STATUS_LABELS = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối"
};
