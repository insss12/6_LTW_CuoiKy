import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import useCategories from "../hooks/useCategories";
import { ApiError, getErrorMessage } from "../services/api";
import {
  createRecipe,
  fetchRecipe,
  updateRecipe
} from "../services/recipeApi";

const initialForm = {
  title: "",
  description: "",
  category: "",
  image: "",
  prepTime: "10",
  cookingTime: "20",
  difficulty: "Dễ",
  servings: "2",

  ingredients: [
    {
      name: "",
      quantity: "",
      unit: ""
    }
  ],

  steps: [
    {
      instruction: ""
    }
  ]
};

function RecipeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, loading: authLoading } = useAuth();
  const { categories } = useCategories();

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [notFound, setNotFound] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(id);

  // Sửa công thức: lấy dữ liệu hiện tại từ server (server kiểm tra quyền sở hữu)
  useEffect(() => {
    if (!id || authLoading) {
      return;
    }

    let active = true;

    async function loadRecipe() {
      setLoadingRecipe(true);

      try {
        const recipe = await fetchRecipe(id, token);

        if (!active) {
          return;
        }

        setForm({
          title: recipe.title,
          description: recipe.description || "",
          category: recipe.categoryId,
          image: recipe.image || "",
          prepTime: String(recipe.prepTime ?? 0),
          cookingTime: String(recipe.cookingTime ?? 0),
          difficulty: recipe.difficulty,
          servings: String(recipe.servings),
          ingredients: recipe.ingredients?.length
            ? recipe.ingredients.map((item) => ({
                name: item.name || "",
                quantity:
                  item.quantity === null || item.quantity === undefined
                    ? ""
                    : String(item.quantity),
                unit: item.unit || ""
              }))
            : initialForm.ingredients,
          steps: recipe.steps?.length
            ? recipe.steps.map((item) => ({
                instruction: item.instruction || ""
              }))
            : initialForm.steps
        });
      } catch (requestError) {
        if (active) {
          if (requestError instanceof ApiError && requestError.status !== 404) {
            setMessage(getErrorMessage(requestError));
          } else {
            setNotFound(true);
          }
        }
      } finally {
        if (active) {
          setLoadingRecipe(false);
        }
      }
    }

    loadRecipe();

    return () => {
      active = false;
    };
  }, [id, token, authLoading]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  // Lỗi của một trường (từ kiểm tra ở client hoặc do server trả về)
  const errorOf = (field) => fieldErrors[field] || "";

  const showError = (field) =>
    errorOf(field) ? (
      <p className="form-message" role="alert">{errorOf(field)}</p>
    ) : null;

  // Kiểm tra nhanh ở client để báo lỗi ngay; server vẫn kiểm tra lại đầy đủ
  function validateForm() {
    const errors = {};

    if (form.title.trim().length < 3) {
      errors.title = "Tên món phải có ít nhất 3 ký tự.";
    }

    if (!form.category) {
      errors.category = "Vui lòng chọn danh mục.";
    }

    if (form.image.trim() && !/^https?:\/\/\S+$/.test(form.image.trim())) {
      errors.image = "Ảnh phải là đường dẫn bắt đầu bằng http:// hoặc https://.";
    }

    if (Number(form.prepTime) + Number(form.cookingTime) < 1) {
      errors.cookingTime = "Tổng thời gian chuẩn bị và nấu phải lớn hơn 0.";
    }

    if (!form.ingredients.some((item) => item.name.trim() !== "")) {
      errors.ingredients = "Vui lòng nhập ít nhất một nguyên liệu.";
    }

    if (!form.steps.some((step) => step.instruction.trim() !== "")) {
      errors.steps = "Vui lòng nhập ít nhất một bước nấu.";
    }

    return errors;
  }

function addIngredient() {
    setForm((previous) => ({
      ...previous,
      ingredients: [
        ...previous.ingredients,
        {
          name: "",
          quantity: "",
          unit: ""
        }
      ]
    }));
  }

  function updateIngredient(index, field, value) {
    setForm((previous) => ({
      ...previous,
      ingredients: previous.ingredients.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      )
    }));
  }

  function removeIngredient(index) {
    setForm((previous) => ({
      ...previous,
      ingredients: previous.ingredients.length > 1
        ? previous.ingredients.filter((item, i) => i !== index)
        : previous.ingredients
    }));
  }

  function addStep() {
    setForm((previous) => ({
      ...previous,
      steps: [
        ...previous.steps,
        { instruction: "" }
      ]
    }));
  }

  function updateStep(index, value) {
    setForm((previous) => ({
      ...previous,
      steps: previous.steps.map((step, i) =>
        i === index
          ? { ...step, instruction: value }
          : step
      )
    }));
  }

  function removeStep(index) {
    setForm((previous) => ({
      ...previous,
      steps: previous.steps.length > 1
        ? previous.steps.filter((step, i) => i !== index)
        : previous.steps
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage("Vui lòng kiểm tra lại các trường báo lỗi.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      image: form.image.trim(),
      prepTime: Number(form.prepTime),
      cookingTime: Number(form.cookingTime),
      difficulty: form.difficulty,
      servings: Number(form.servings),

      ingredients: form.ingredients
        .filter((item) => item.name.trim() !== "")
        .map((item) => ({
          name: item.name.trim(),
          quantity: item.quantity.trim(),
          unit: item.unit.trim()
        })),

      steps: form.steps
        .filter((step) => step.instruction.trim() !== "")
        .map((step) => ({ instruction: step.instruction.trim() }))
    };

    setSubmitting(true);

    try {
      const result = isEditing
        ? await updateRecipe(token, id, payload)
        : await createRecipe(token, payload);

      navigate("/cong-thuc-cua-toi", {
        state: { message: result.message }
      });
    } catch (requestError) {
      // Gắn lỗi do server trả về vào đúng trường
      if (requestError instanceof ApiError && Array.isArray(requestError.details)) {
        const serverErrors = {};

        requestError.details.forEach(({ field, message: text }) => {
          serverErrors[field] = text;
        });

        setFieldErrors(serverErrors);
      }

      setMessage(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <div className="simple-empty">
        <h3>Không tìm thấy công thức</h3>
        <Link to="/cong-thuc-cua-toi">
          Quay lại công thức của tôi
        </Link>
      </div>
    );
  }

  if (loadingRecipe) {
    return (
      <div className="recipe-form-page">
        <p>Đang tải công thức...</p>
      </div>
    );
  }

  return (
    <div className="recipe-form-page">

      <div className="recipe-form-header">

        <Link to="/cong-thuc-cua-toi">
          ← Quay lại
        </Link>

        <h1>
          {isEditing ? "Sửa công thức" : "Đăng công thức mới"}
        </h1>

        <p>
          Chia sẻ công thức nấu ăn của bạn với mọi người.
        </p>

      </div>

      <form
        className="recipe-form"
        onSubmit={handleSubmit}
      >

        <h2>1. Thông tin món ăn</h2>

        <div className="form-group">
          <label htmlFor="title">Tên món ăn *</label>

          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Ví dụ: Gà kho gừng"
            maxLength={120}
          />

          {showError("title")}
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả món ăn</label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Giới thiệu về món ăn..."
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Đường dẫn ảnh món ăn</label>

          <input
            id="image"
            name="image"
            type="url"
            value={form.image}
            onChange={handleChange}
            placeholder="https://..."
            maxLength={500}
          />

          <small>
            Dán đường dẫn ảnh (http/https). Tải ảnh từ máy lên sẽ bổ sung ở bước upload.
          </small>

          {showError("image")}

          {form.image.trim() && !errorOf("image") && (
            <div className="image-preview">
              <img src={form.image.trim()} alt="Ảnh xem trước món ăn" />
            </div>
          )}
        </div>

        <div className="form-row">

          <div className="form-group">
            <label htmlFor="category">Danh mục *</label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Chọn danh mục</option>

              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            {showError("category")}
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Độ khó</label>

            <select
              id="difficulty"
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
            >
              <option value="Dễ">Dễ</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Khó">Khó</option>
            </select>
          </div>

        </div>

        <div className="form-row">

          <div className="form-group">
            <label htmlFor="prepTime">Thời gian chuẩn bị (phút)</label>

            <input
              id="prepTime"
              name="prepTime"
              type="number"
              min="0"
              value={form.prepTime}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cookingTime">Thời gian nấu (phút)</label>

            <input
              id="cookingTime"
              name="cookingTime"
              type="number"
              min="0"
              value={form.cookingTime}
              onChange={handleChange}
            />

            {showError("cookingTime")}
          </div>

          <div className="form-group">
            <label htmlFor="servings">Khẩu phần</label>

            <input
              id="servings"
              name="servings"
              type="number"
              min="1"
              value={form.servings}
              onChange={handleChange}
            />
          </div>

        </div>

        <h2>2. Nguyên liệu</h2>

        <p className="recipe-form-note">
          Thêm những nguyên liệu cần thiết cho món ăn.
        </p>

        {form.ingredients.map((item, index) => (

          <div
            className="dynamic-form-row ingredient-row"
            key={index}
          >

            <div className="form-group">
              <label>Tên nguyên liệu {index + 1}</label>

              <input
                type="text"
                value={item.name}
                onChange={(event) =>
                  updateIngredient(index, "name", event.target.value)
                }
                placeholder="Ví dụ: Thịt gà"
              />
            </div>

            <div className="form-group">
              <label>Số lượng</label>

              <input
                type="text"
                value={item.quantity}
                onChange={(event) =>
                  updateIngredient(index, "quantity", event.target.value)
                }
                placeholder="Ví dụ: 500"
              />
            </div>

            <div className="form-group">
              <label>Đơn vị</label>

              <input
                type="text"
                value={item.unit}
                onChange={(event) =>
                  updateIngredient(index, "unit", event.target.value)
                }
                placeholder="Ví dụ: gram"
              />
            </div>

            <button
              type="button"
              className="remove-row-button"
              onClick={() => removeIngredient(index)}
            >
              Xóa
            </button>

            {[`ingredients[${index}].name`, `ingredients[${index}].quantity`, `ingredients[${index}].unit`]
              .map((field) => showError(field))}

          </div>

        ))}

        {showError("ingredients")}

        <button
          type="button"
          className="add-row-button"
          onClick={addIngredient}
        >
          + Thêm nguyên liệu
        </button>

        <h2>3. Các bước thực hiện</h2>

        <p className="recipe-form-note">
          Mô tả lần lượt từng bước nấu món ăn.
        </p>

        {form.steps.map((step, index) => (

          <div
            className="step-form-row"
            key={index}
          >

            <div className="step-form-heading">
              <strong>Bước {index + 1}</strong>

              <button
                type="button"
                onClick={() => removeStep(index)}
              >
                Xóa bước
              </button>
            </div>

            <textarea
              rows="3"
              value={step.instruction}
              onChange={(event) =>
                updateStep(index, event.target.value)
              }
              placeholder="Mô tả bước thực hiện..."
            />

            {showError(`steps[${index}]`)}

          </div>

        ))}

        {showError("steps")}

        <button
          type="button"
          className="add-row-button"
          onClick={addStep}
        >
          + Thêm bước nấu
        </button>

        {message && (
          <p className="form-message">
            {message}
          </p>
        )}

        <div className="recipe-form-actions">

          <Link
            to="/cong-thuc-cua-toi"
            className="cancel-button"
          >
            Hủy
          </Link>

          <button
            type="submit"
            className="save-recipe-button"
            disabled={submitting || loadingRecipe}
          >
            {submitting
              ? "Đang lưu..."
              : isEditing
                ? "Lưu thay đổi"
                : "Đăng công thức"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default RecipeFormPage;