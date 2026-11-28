import { normalizeText } from "./text.js";

export const DIFFICULTIES = ["Dễ", "Trung bình", "Khó"];

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

export const isObjectId = (value) =>
  typeof value === "string" && OBJECT_ID.test(value);

const round3 = (number) => Math.round(number * 1000) / 1000;

// Đổi số lượng nguyên liệu về số: 500, "0,5", "1/2", "1 1/2" -> số thực.
// Để trống thì trả về null (ví dụ "muối vừa đủ").
export const parseQuantity = (raw) => {
  if (raw === undefined || raw === null) {
    return { ok: true, value: null };
  }

  if (typeof raw === "number") {
    return Number.isFinite(raw) && raw >= 0 && raw <= 100000
      ? { ok: true, value: round3(raw) }
      : { ok: false };
  }

  if (typeof raw !== "string") {
    return { ok: false };
  }

  const text = raw.trim().replace(",", ".");

  if (text === "") {
    return { ok: true, value: null };
  }

  let match = text.match(/^(\d+(?:\.\d+)?)$/);
  if (match) {
    const value = Number(match[1]);
    return value <= 100000 ? { ok: true, value: round3(value) } : { ok: false };
  }

  // Hỗn số: "1 1/2"
  match = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (match && Number(match[3]) !== 0) {
    return {
      ok: true,
      value: round3(Number(match[1]) + Number(match[2]) / Number(match[3]))
    };
  }

  // Phân số: "1/2"
  match = text.match(/^(\d+)\/(\d+)$/);
  if (match && Number(match[2]) !== 0) {
    return { ok: true, value: round3(Number(match[1]) / Number(match[2])) };
  }

  return { ok: false };
};

// Kiểm tra dữ liệu công thức gửi lên và trả về bản đã làm sạch.
// Chỉ lấy các trường được phép (chống người dùng tự gán status, author, rating...).
// Trả về { errors, value }. errors rỗng nghĩa là hợp lệ.
export const validateRecipeInput = (body) => {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    add("body", "Dữ liệu gửi lên không hợp lệ");
    return { errors, value: null };
  }

  const text = (raw) => (typeof raw === "string" ? raw.trim() : "");

  const readInt = (raw, { field, label, min, max, fallback }) => {
    if ((raw === undefined || raw === null || raw === "") && fallback !== undefined) {
      return fallback;
    }

    let number = NaN;
    if (typeof raw === "number") {
      number = raw;
    } else if (typeof raw === "string" && /^\d+$/.test(raw.trim())) {
      number = Number(raw.trim());
    }

    if (!Number.isInteger(number) || number < min || number > max) {
      add(field, `${label} phải là số nguyên từ ${min} đến ${max}`);
      return null;
    }

    return number;
  };

  // Tên món
  const title = text(body.title);
  if (title.length < 3 || title.length > 120) {
    add("title", "Tên món phải từ 3 đến 120 ký tự");
  }

  // Mô tả (không bắt buộc)
  const description = text(body.description);
  if (description.length > 1000) {
    add("description", "Mô tả tối đa 1000 ký tự");
  }

  // Loại món (kiểm tra có tồn tại trong CSDL ở controller)
  const category = typeof body.category === "string" ? body.category.trim() : "";
  if (!isObjectId(category)) {
    add("category", "Vui lòng chọn loại món hợp lệ");
  }

  // Ảnh: tạm thời chỉ nhận đường dẫn/URL. Upload file sẽ làm ở bước Multer.
  const image = text(body.image);
  if (image !== "") {
    const validImage = /^https?:\/\/\S+$/.test(image) || /^\/uploads\/\S+$/.test(image);
    if (!validImage || image.length > 500) {
      add("image", "Ảnh phải là đường dẫn http(s) hoặc /uploads/... (tối đa 500 ký tự)");
    }
  }

  // Thời gian và khẩu phần
  const prepTime = readInt(body.prepTime, {
    field: "prepTime", label: "Thời gian chuẩn bị", min: 0, max: 1440, fallback: 0
  });
  const cookingTime = readInt(body.cookingTime, {
    field: "cookingTime", label: "Thời gian nấu", min: 0, max: 1440, fallback: 0
  });
  const servings = readInt(body.servings, {
    field: "servings", label: "Khẩu phần", min: 1, max: 50
  });

  if (prepTime !== null && cookingTime !== null && prepTime + cookingTime < 1) {
    add("cookingTime", "Tổng thời gian chuẩn bị và nấu phải lớn hơn 0");
  }

  // Độ khó
  const difficulty = text(body.difficulty) || DIFFICULTIES[0];
  if (!DIFFICULTIES.includes(difficulty)) {
    add("difficulty", `Độ khó phải là một trong: ${DIFFICULTIES.join(", ")}`);
  }

  // Nguyên liệu
  const ingredients = [];
  if (!Array.isArray(body.ingredients) || body.ingredients.length < 1 || body.ingredients.length > 50) {
    add("ingredients", "Cần từ 1 đến 50 nguyên liệu");
  } else {
    body.ingredients.forEach((item, index) => {
      const source = typeof item === "string" ? { name: item } : item;

      if (!source || typeof source !== "object") {
        add(`ingredients[${index}]`, "Nguyên liệu không hợp lệ");
        return;
      }

      const name = text(source.name);
      const unit = text(source.unit);
      const quantity = parseQuantity(source.quantity);

      if (name.length < 1 || name.length > 80) {
        add(`ingredients[${index}].name`, "Tên nguyên liệu phải từ 1 đến 80 ký tự");
      }
      if (!quantity.ok) {
        add(`ingredients[${index}].quantity`, "Số lượng phải là số (ví dụ 500, 0.5 hoặc 1/2)");
      }
      if (unit.length > 30) {
        add(`ingredients[${index}].unit`, "Đơn vị tối đa 30 ký tự");
      }

      ingredients.push({ name, quantity: quantity.ok ? quantity.value : null, unit });
    });
  }

  // Các bước làm: số thứ tự do server tự đánh theo vị trí
  const steps = [];
  if (!Array.isArray(body.steps) || body.steps.length < 1 || body.steps.length > 50) {
    add("steps", "Cần từ 1 đến 50 bước làm");
  } else {
    body.steps.forEach((item, index) => {
      const instruction = text(typeof item === "string" ? item : item?.instruction);

      if (instruction.length < 1 || instruction.length > 1000) {
        add(`steps[${index}]`, "Mỗi bước phải từ 1 đến 1000 ký tự");
      }

      steps.push({ stepNumber: index + 1, instruction });
    });
  }

  if (errors.length > 0) {
    return { errors, value: null };
  }

  // Các trường suy ra để tìm kiếm nhanh ở server
  const ingredientKeys = [
    ...new Set(ingredients.map((item) => normalizeText(item.name)).filter(Boolean))
  ];

  return {
    errors,
    value: {
      title,
      titleKey: normalizeText(title),
      description,
      category,
      image,
      prepTime,
      cookingTime,
      totalTime: prepTime + cookingTime,
      difficulty,
      servings,
      ingredients,
      ingredientKeys,
      steps
    }
  };
};
