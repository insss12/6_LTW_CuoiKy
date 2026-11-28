import { useState } from "react";
import { Link } from "react-router-dom";

import RecipeCard from "../components/RecipeCard";
import useCategories from "../hooks/useCategories";
import useDebounce from "../hooks/useDebounce";
import useRecipeList from "../hooks/useRecipeList";

const FEATURED_COUNT = 8;

function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { categories } = useCategories();
  const debouncedKeyword = useDebounce(keyword.trim(), 400);

  const { items, total, loading, error } = useRecipeList(
    { q: debouncedKeyword, category: categoryId },
    { limit: FEATURED_COUNT }
  );

  function handleReset() {
    setKeyword("");
    setCategoryId("");
  }

  return (
    <div className="simple-home">
      <section className="simple-intro">
        <h1>Sổ tay công thức nấu ăn</h1>

        <p>
          Chào mừng bạn đến với Bếp Nhà!
          <br />
          Cùng khám phá và chia sẻ những công thức
          nấu ăn ngon cho mỗi bữa cơm gia đình.
        </p>

        <button
          type="button"
          onClick={() =>
            document
              .getElementById("cong-thuc")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Khám phá công thức
        </button>
      </section>

      <section className="simple-search">
        <h2>Tìm kiếm món ăn</h2>

        <input
          type="search"
          placeholder="Nhập tên món ăn..."
          aria-label="Tìm theo tên món ăn"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />

        <button type="button" onClick={handleReset}>
          Xóa tìm kiếm
        </button>
      </section>

      <section className="simple-category">
        <h2>Danh mục món ăn</h2>

        <div className="simple-category-list">
          <button
            type="button"
            className={categoryId === "" ? "selected" : ""}
            onClick={() => setCategoryId("")}
          >
            Tất cả
          </button>

          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              className={categoryId === item.id ? "selected" : ""}
              onClick={() => setCategoryId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </section>

      <section className="simple-recipes" id="cong-thuc">
        <div className="section-title-row">
          <h2>Món ngon nổi bật</h2>

          <Link to="/cong-dong" className="section-title-link">
            Xem tất cả công thức cộng đồng →
          </Link>
        </div>

        {loading ? (
          <p>Đang tải công thức...</p>
        ) : error ? (
          <div className="simple-empty">
            <h3>Không tải được công thức</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <p>
              Hiển thị {items.length} / {total} công thức.
            </p>

            {items.length === 0 ? (
              <div className="simple-empty">
                <h3>Không tìm thấy món ăn</h3>

                <p>Hãy thử tìm kiếm bằng tên món khác.</p>

                <button type="button" onClick={handleReset}>
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="simple-recipe-list">
                {items.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}

            {total > FEATURED_COUNT && (
              <div className="load-more-wrap">
                <Link to="/cong-dong" className="load-more-button">
                  Xem thêm {total - FEATURED_COUNT} công thức
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default HomePage;
