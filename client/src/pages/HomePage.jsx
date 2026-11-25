import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import RecipeCard from "../components/RecipeCard";
import { recipeRepository } from "../utils/recipeStorage";
import {
  ALL_CATEGORIES,
  RECIPE_CATEGORIES,
  RecipeFilter
} from "../utils/recipeHelpers";

const FEATURED_COUNT = 8;
const CATEGORIES = [ALL_CATEGORIES, ...RECIPE_CATEGORIES];

function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);

  const allRecipes = useMemo(() => recipeRepository.getAll(), []);

  const filteredRecipes = useMemo(
    () =>
      RecipeFilter.apply(allRecipes, { keyword, ingredient, category }),
    [allRecipes, keyword, ingredient, category]
  );

  const featuredRecipes = filteredRecipes.slice(0, FEATURED_COUNT);

  function handleReset() {
    setKeyword("");
    setIngredient("");
    setCategory(ALL_CATEGORIES);
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
          type="text"
          placeholder="Nhập tên món ăn..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />

        <input
          type="text"
          placeholder="Nhập nguyên liệu, ví dụ: thịt gà, trứng..."
          value={ingredient}
          onChange={(event) => setIngredient(event.target.value)}
        />

        <button type="button" onClick={handleReset}>
          Xóa tìm kiếm
        </button>
      </section>

      <section className="simple-category">
        <h2>Danh mục món ăn</h2>

        <div className="simple-category-list">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? "selected" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
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

        <p>
          Hiển thị {featuredRecipes.length} / {filteredRecipes.length} công thức.
        </p>

        {filteredRecipes.length === 0 ? (
          <div className="simple-empty">
            <h3>Không tìm thấy món ăn</h3>

            <p>Hãy thử tìm kiếm bằng tên món hoặc nguyên liệu khác.</p>

            <button type="button" onClick={handleReset}>
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="simple-recipe-list">
            {featuredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {filteredRecipes.length > FEATURED_COUNT && (
          <div className="load-more-wrap">
            <Link to="/cong-dong" className="load-more-button">
              Xem thêm {filteredRecipes.length - FEATURED_COUNT} công thức
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;