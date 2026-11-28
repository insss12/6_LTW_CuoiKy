import { useState } from "react";

import RecipeCard from "../components/RecipeCard";
import useCategories from "../hooks/useCategories";
import useDebounce from "../hooks/useDebounce";
import useRecipeList from "../hooks/useRecipeList";

const PAGE_SIZE = 9;

function CommunityRecipesPage() {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { categories } = useCategories();

  // Chờ người dùng gõ xong mới gọi server
  const debouncedKeyword = useDebounce(keyword.trim(), 400);

  const { items, total, loading, loadingMore, error, hasMore, loadMore } =
    useRecipeList(
      { q: debouncedKeyword, category: categoryId },
      { limit: PAGE_SIZE }
    );

  function handleReset() {
    setKeyword("");
    setCategoryId("");
  }

  return (
    <div className="simple-home">
      <section className="simple-intro">
        <h1>Công thức cộng đồng</h1>

        <p>
          Tất cả công thức được chia sẻ trên Bếp Nhà,
          <br />
          do thành viên đăng và đã được Admin duyệt.
        </p>
      </section>

      <section className="simple-search">
        <h2>Tìm kiếm công thức</h2>

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

      <section className="simple-recipes">
        <h2>Tất cả công thức</h2>

        {loading ? (
          <p>Đang tải công thức...</p>
        ) : error ? (
          <div className="simple-empty">
            <h3>Không tải được công thức</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <p>Có {total} công thức.</p>

            {items.length === 0 ? (
              <div className="simple-empty">
                <h3>Không tìm thấy công thức</h3>

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

            {hasMore && (
              <div className="load-more-wrap">
                <button
                  type="button"
                  className="load-more-button"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Đang tải..." : "Xem thêm"}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default CommunityRecipesPage;
