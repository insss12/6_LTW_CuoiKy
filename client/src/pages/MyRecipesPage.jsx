import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import {
  deleteRecipe,
  fetchMyRecipes,
  STATUS_LABELS
} from "../services/recipeApi";

function MyRecipesPage() {
  const { token } = useAuth();
  const location = useLocation();

  const [recipes, setRecipes] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(location.state?.message || "");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRecipes() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchMyRecipes(token, { limit: 50 });

        if (active) {
          setRecipes(data.items);
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRecipes();

    return () => {
      active = false;
    };
  }, [token]);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa công thức này không?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setMessage("");

    try {
      await deleteRecipe(token, id);

      setRecipes((current) => current.filter((recipe) => recipe.id !== id));
    } catch (requestError) {
      setMessage(getErrorMessage(requestError));
    } finally {
      setDeletingId("");
    }
  }

  const filteredRecipes = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    return recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(text)
    );
  }, [recipes, keyword]);

  return (
    <div className="my-recipes-page">
      <div className="my-recipes-header">
        <div>
          <h1>Công thức của tôi</h1>
          <p>Xem lại và quản lý các công thức nấu ăn bạn đã đăng.</p>
        </div>

        <Link to="/dang-cong-thuc" className="my-recipes-add">
          + Đăng công thức
        </Link>
      </div>

      <div className="my-recipes-search">
        <input
          type="search"
          placeholder="Tìm công thức của bạn..."
          aria-label="Tìm công thức của bạn"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />

        <span>{filteredRecipes.length} công thức</span>
      </div>

      {message && <p className="form-message">{message}</p>}

      {loading ? (
        <p>Đang tải công thức của bạn...</p>
      ) : error ? (
        <div className="my-recipes-empty">
          <h3>Không tải được công thức</h3>
          <p>{error}</p>
        </div>
      ) : filteredRecipes.length === 0 ? (
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
            <Link to="/dang-cong-thuc" className="my-recipes-add">
              Đăng công thức đầu tiên
            </Link>
          )}
        </div>
      ) : (
        <div className="my-recipes-list">
          {filteredRecipes.map((recipe) => (
            <article className="my-recipe-card" key={recipe.id}>
              <Link to={`/cong-thuc/${recipe.id}`}>
                {recipe.image ? (
                  <img src={recipe.image} alt={recipe.title} />
                ) : (
                  <div className="my-recipe-no-image">Chưa có ảnh</div>
                )}
              </Link>

              <div className="my-recipe-info">
                <span className="my-recipe-category">
                  {recipe.category}
                </span>

                <h3>
                  <Link to={`/cong-thuc/${recipe.id}`}>
                    {recipe.title}
                  </Link>
                </h3>

                <p>
                  <strong>
                    {STATUS_LABELS[recipe.status] || recipe.status}
                  </strong>
                  {recipe.status === "rejected" && recipe.rejectionReason
                    ? ` – ${recipe.rejectionReason}`
                    : ""}
                </p>

                <p>{recipe.description}</p>

                <p>Thời gian: {recipe.time} phút</p>

                <div className="my-recipe-actions">
                  <Link
                    to={`/cong-thuc/${recipe.id}`}
                    className="view-button"
                  >
                    Xem
                  </Link>

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
                    disabled={deletingId === recipe.id}
                  >
                    {deletingId === recipe.id ? "Đang xóa..." : "Xóa"}
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
