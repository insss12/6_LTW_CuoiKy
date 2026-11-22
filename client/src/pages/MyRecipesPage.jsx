import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMyRecipes,
  saveMyRecipes
} from "../utils/recipeStorage";

function MyRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setRecipes(getMyRecipes());
  }, []);

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa công thức này không?"
    );

    if (!confirmed) {
      return;
    }

    const updatedRecipes = recipes.filter(
      (recipe) => recipe.id !== id
    );

    saveMyRecipes(updatedRecipes);
    setRecipes(updatedRecipes);
  }

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(
      keyword.toLowerCase()
    )
  );

  return (
    <div className="my-recipes-page">

      <div className="my-recipes-header">
        <div>
          <h1>Công thức của tôi</h1>
          <p>Quản lý các công thức nấu ăn bạn đã đăng.</p>
        </div>

        <Link
          to="/dang-cong-thuc"
          className="my-recipes-add"
        >
          + Đăng công thức
        </Link>
      </div>

      <div className="my-recipes-search">
        <input
          type="text"
          placeholder="Tìm công thức của bạn..."
          value={keyword}
          onChange={(event) =>
            setKeyword(event.target.value)
          }
        />

        <span>
          {filteredRecipes.length} công thức
        </span>
      </div>

      {filteredRecipes.length === 0 ? (

        <div className="my-recipes-empty">
          <div className="empty-icon">🍳</div>

          <h3>
            {recipes.length === 0
              ? "Bạn chưa có công thức nào"
              : "Không tìm thấy công thức"}
          </h3>

          <p>
            {recipes.length === 0
              ? "Hãy bắt đầu chia sẻ món ăn đầu tiên của bạn."
              : "Thử tìm bằng tên món ăn khác nhé."}
          </p>

          {recipes.length === 0 && (
            <Link
              to="/dang-cong-thuc"
              className="my-recipes-add"
            >
              Đăng công thức đầu tiên
            </Link>
          )}
        </div>

      ) : (

        <div className="my-recipes-list">

          {filteredRecipes.map((recipe) => (

            <article
              className="my-recipe-card"
              key={recipe.id}
            >

              {recipe.image ? (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                />
              ) : (
                <div className="my-recipe-no-image">
                  Chưa có ảnh
                </div>
              )}

              <div className="my-recipe-info">

                <span className="my-recipe-category">
                  {recipe.category}
                </span>

                <h3>{recipe.title}</h3>

                <p>{recipe.description}</p>

                <p>
                  Thời gian: {recipe.time} phút
                </p>

                <span
                  className={`recipe-status ${recipe.status}`}
                >
                  {recipe.status === "approved"
                    ? "Đã duyệt"
                    : recipe.status === "rejected"
                    ? "Bị từ chối"
                    : "Chờ duyệt"}
                </span>

                <div className="my-recipe-actions">

                  <Link
                    to={`/sua-cong-thuc/${recipe.id}`}
                    className="edit-button"
                  >
                    Sửa
                  </Link>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDelete(recipe.id)}
                  >
                    Xóa
                  </button>

                </div>

              </div>

            </article>

          ))}

        </div>

      )}

    </div>
  );
}

export default MyRecipesPage;
