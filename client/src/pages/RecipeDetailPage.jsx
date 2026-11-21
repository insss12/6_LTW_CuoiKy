import { Link, useParams } from "react-router-dom";
import recipes from "../data/recipes.js";

function RecipeDetailPage() {
  const { id } = useParams();

  const recipe = recipes.find((item) => item.id === id);

  if (!recipe) {
    return (
      <div className="not-found">
        <span>404</span>
        <h2>Không tìm thấy công thức</h2>
        <p>Công thức này có thể đã bị xóa hoặc không tồn tại.</p>

        <Link to="/" className="header-button">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="detail-container">

        <Link to="/" className="back-link">
          ← Quay lại danh sách công thức
        </Link>

        {/* THÔNG TIN MÓN ĂN */}
        <div className="detail-hero">

          <img
            src={recipe.image}
            alt={recipe.title}
          />

          <div className="detail-intro">

            <span className="recipe-category">
              {recipe.category}
            </span>

            <h1>{recipe.title}</h1>

            <p>{recipe.description}</p>

            <div className="detail-rating">
              <span>★ {recipe.rating}</span>
              <span>
                {recipe.reviewCount} lượt đánh giá
              </span>
            </div>

            <div className="detail-meta">

              <div>
                <span>◷</span>
                <strong>{recipe.time} phút</strong>
                <small>Thời gian</small>
              </div>

              <div>
                <span>♨</span>
                <strong>{recipe.difficulty}</strong>
                <small>Độ khó</small>
              </div>

              <div>
                <span>♧</span>
                <strong>{recipe.servings} người</strong>
                <small>Khẩu phần</small>
              </div>

            </div>

            <p className="detail-author">
              Công thức từ{" "}
              <strong>{recipe.author}</strong>
            </p>

          </div>
        </div>

        {/* NỘI DUNG CÔNG THỨC */}
        <div className="detail-content">

          {/* NGUYÊN LIỆU */}
          <section className="detail-ingredients">

            <div className="detail-section-title">
              <span>01</span>
              <h2>Nguyên liệu</h2>
            </div>

            <p className="detail-subtitle">
              Chuẩn bị nguyên liệu cho {recipe.servings} người.
            </p>

            <ul className="ingredient-list">

              {recipe.ingredients.map((ingredient, index) => (
                <li key={`${ingredient}-${index}`}>
                  <span className="ingredient-check">
                    ✓
                  </span>

                  {ingredient}
                </li>
              ))}

            </ul>

          </section>

          {/* CÁC BƯỚC NẤU */}
          <section className="detail-steps">

            <div className="detail-section-title">
              <span>02</span>
              <h2>Các bước thực hiện</h2>
            </div>

            <p className="detail-subtitle">
              Thực hiện lần lượt theo hướng dẫn.
            </p>

            <div className="steps-list">

              {recipe.steps.map((step, index) => (
                <article
                  className="step-item"
                  key={`${recipe.id}-step-${index}`}
                >
                  <span className="step-number">
                    {index + 1}
                  </span>

                  <p>{step}</p>
                </article>
              ))}

            </div>

          </section>

        </div>

        <div className="detail-bottom">
          Chúc bạn có một bữa ăn thật ngon! ♡
        </div>

      </div>
    </div>
  );
}

export default RecipeDetailPage;