import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getMyRecipes,
  saveMyRecipes
} from "../utils/recipeStorage";

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

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

  const isEditing = Boolean(id);

  // Nếu đang sửa thì lấy dữ liệu cũ
  useEffect(() => {
    if (!id) {
      return;
    }

    const recipe = getMyRecipes().find(
      (item) => item.id === id
    );

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

  // Thay đổi thông tin chung
  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  // Thêm nguyên liệu
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

  // Thay đổi nguyên liệu
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

  // Xóa nguyên liệu
  function removeIngredient(index) {
    setForm((previous) => ({
      ...previous,
      ingredients: previous.ingredients.length > 1
        ? previous.ingredients.filter((item, i) => i !== index)
        : previous.ingredients
    }));
  }

  // Thêm bước nấu
  function addStep() {
    setForm((previous) => ({
      ...previous,
      steps: [
        ...previous.steps,
        { instruction: "" }
      ]
    }));
  }

  // Thay đổi bước nấu
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

  // Xóa bước nấu
  function removeStep(index) {
    setForm((previous) => ({
      ...previous,
      steps: previous.steps.length > 1
        ? previous.steps.filter((step, i) => i !== index)
        : previous.steps
    }));
  }

  // Kiểm tra và lưu công thức
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

    const oldRecipes = getMyRecipes();

    const oldRecipe = oldRecipes.find(
      (item) => item.id === id
    );

    const now = new Date().toISOString();

    const recipeData = {
      id: id || Date.now().toString(),

      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      image: form.image.trim(),

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

      author: "Tài khoản của tôi",

      // Công thức mới sẽ chờ Admin duyệt
      status: oldRecipe?.status || "pending",

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

    saveMyRecipes(updatedRecipes);

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

        {/* THÔNG TIN CƠ BẢN */}

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
          <label htmlFor="image">Đường dẫn ảnh món ăn</label>

          <input
            id="image"
            name="image"
            type="url"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/food.jpg"
          />

          <small>
            Hiện tại nhập đường dẫn ảnh. Chức năng upload sẽ làm sau.
          </small>
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
              <option value="Món chính">Món chính</option>
              <option value="Món nước">Món nước</option>
              <option value="Món chay">Món chay</option>
              <option value="Ăn sáng">Ăn sáng</option>
              <option value="Món khai vị">Món khai vị</option>
              <option value="Tráng miệng">Tráng miệng</option>
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

        {/* NGUYÊN LIỆU */}

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

        {/* CÁC BƯỚC NẤU */}

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

        {/* THÔNG BÁO LỖI */}

        {message && (
          <p className="form-message">
            {message}
          </p>
        )}

        {/* NÚT LƯU */}

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
          >
            {isEditing ? "Lưu thay đổi" : "Đăng công thức"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default RecipeFormPage;
