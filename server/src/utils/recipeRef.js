import Recipe from "../models/Recipe.js";
import ApiError from "./ApiError.js";
import { isObjectId } from "./recipeValidation.js";

const KEY_PATTERN = /^[a-zA-Z0-9_-]{1,120}$/;

// Tìm công thức từ mã trên URL. Nhận cả hai dạng:
//   - _id của công thức (24 ký tự hex)
//   - mã cũ của công thức mẫu, ví dụ "mau-1" (trường legacyKey)
// Nhờ vậy client hiện tại (đang dùng "mau-1") vẫn chạy trong lúc chuyển sang _id.
//
// onlyApproved = true: chỉ chấp nhận công thức đã duyệt (xem, thích, đánh giá, đếm lượt xem).
// onlyApproved = false: dùng khi người dùng gỡ dữ liệu của chính mình (bỏ thích, xóa
// nhận xét), vì lúc đó công thức có thể đã bị ẩn.
export const resolveRecipe = async (rawKey, { onlyApproved = true } = {}) => {
  const key = typeof rawKey === "string" ? rawKey.trim() : "";

  if (!KEY_PATTERN.test(key)) {
    throw ApiError.badRequest("Mã công thức không hợp lệ");
  }

  const filter = isObjectId(key) ? { _id: key } : { legacyKey: key };

  if (onlyApproved) {
    filter.status = "approved";
  }

  const recipe = await Recipe.findOne(filter)
    .select("_id legacyKey title status")
    .lean();

  if (!recipe) {
    throw ApiError.notFound("Không tìm thấy công thức");
  }

  return recipe;
};

// Mã công thức trả về cho client: giữ "mau-1" cho món mẫu để client cũ khớp được,
// món khác dùng _id.
export const recipeKeyOf = (recipe) =>
  recipe.legacyKey || String(recipe._id);
