// Chuẩn hóa chữ để tìm kiếm không phân biệt hoa/thường và dấu tiếng Việt.
// Ví dụ: "Gà Rán" -> "ga ran", "Đậu hũ" -> "dau hu"
export const normalizeText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();

// Escape ký tự đặc biệt trước khi đưa chuỗi người dùng nhập vào $regex
export const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// "Món chính" -> "mon-chinh"
export const slugify = (value) =>
  normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
