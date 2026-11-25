import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import { recipeRepository } from "../utils/recipeStorage";
import { imageProcessor } from "../utils/imageProcessor";
import { RECIPE_CATEGORIES } from "../utils/recipeHelpers";

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
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [imageError, setImageError] = useState("");
  const [processingImage, setProcessingImage] = useState(false);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (!id) {
      return;
    }

    const recipe = recipeRepository.findMine(id);

    if (!recipe) {
      setNotFound(true);
      return;
    }

    setForm({
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      image: recipe.image || "",
      prepTime: String(recipe.prepTime ?? 10),
      cookingTime: String(recipe.cookingTime ?? 20),
      difficulty: recipe.difficulty,
      servings: String(recipe.servings),
      ingredients: recipe.ingredients?.length
        ? recipe.ingredients.map((item) => ({
            name: item.name || "",
            quantity: item.quantity || "",
            unit: item.unit || ""
          }))
        : initialForm.ingredients,
      steps: recipe.steps?.length
        ? recipe.steps.map((item) => ({
            instruction: item.instruction || ""
          }))
        : initialForm.steps
    });
  }, [id]);

  async function handleImageChange(event) {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const error = imageProcessor.validate(file);

    if (error) {
      setImageError(error);
      input.value = "";
      return;
    }

    setImageError("");
    setProcessingImage(true);

    try {
      const dataUrl = await imageProcessor.toDataUrl(file);

      setForm((previous) => ({
        ...previous,
        image: dataUrl
      }));
    } catch (processError) {
      setImageError(processError.message);
    } finally {
      setProcessingImage(false);
      input.value = "";
    }
  }

  function handleRemoveImage() {
    setForm((previous) => ({
      ...previous,
      image: ""
    }));

    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
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

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const validIngredients = form.ingredients.filter(
      (item) => item.name.trim() !== ""
    );

    const validSteps = form.steps.filter(
      (step) => step.instruction.trim() !== ""
    );

    if (validIngredients.length === 0) {
      setMessage("Vui lòng nhập ít nhất một nguyên liệu.");
      return;
    }

    if (validSteps.length === 0) {
      setMessage("Vui lòng nhập ít nhất một bước nấu.");
      return;
    }

    const oldRecipes = recipeRepository.getMine();

    const oldRecipe = oldRecipes.find(
      (item) => item.id === id
    );

    const now = new Date().toISOString();

    const recipeData = {
      id: id || Date.now().toString(),

      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      image: form.image,

      prepTime: Number(form.prepTime),
      cookingTime: Number(form.cookingTime),

      time:
        Number(form.prepTime) +
        Number(form.cookingTime),

      difficulty: form.difficulty,
      servings: Number(form.servings),

      ingredients: validIngredients,

      steps: validSteps.map((step, index) => ({
        stepNumber: index + 1,
        instruction: step.instruction.trim()
      })),

      author: user?.name || oldRecipe?.author || "Tài khoản của tôi",

      createdAt: oldRecipe?.createdAt || now,
      updatedAt: now
    };

    let updatedRecipes;

    if (isEditing) {
      updatedRecipes = oldRecipes.map((item) =>
        item.id === id ? recipeData : item
      );
    } else {
      updatedRecipes = [...oldRecipes, recipeData];
    }

    const saved = recipeRepository.saveMine(updatedRecipes);

    if (!saved) {
      setMessage(
        "Không lưu được vì bộ nhớ trình duyệt đã đầy. Hãy chọn ảnh nhỏ hơn hoặc xóa bớt công thức cũ."
      );
      return;
    }

    navigate("/cong-thuc-cua-toi");
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
            maxLength={100}
            required
          />
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
          <label htmlFor="image">Ảnh món ăn</label>

          <input
            id="image"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={processingImage}
          />

          <small>
            Chọn ảnh JPG, PNG hoặc WEBP từ máy, tối đa 5MB.
          </small>

          {processingImage && (
            <small>Đang xử lý ảnh...</small>
          )}

          {imageError && (
            <p className="form-message">{imageError}</p>
          )}

          {form.image && (
            <div className="image-preview">
              <img src={form.image} alt="Ảnh xem trước món ăn" />

              <button
                type="button"
                className="remove-row-button"
                onClick={handleRemoveImage}
              >
                Xóa ảnh
              </button>
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
              required
            >
              <option value="">Chọn danh mục</option>

              {RECIPE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
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

          </div>

        ))}

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

          </div>

        ))}

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
            disabled={processingImage}
          >
            {isEditing ? "Lưu thay đổi" : "Đăng công thức"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default RecipeFormPage;