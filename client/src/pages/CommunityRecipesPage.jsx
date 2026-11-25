import { useMemo, useState } from "react";

import RecipeCard from "../components/RecipeCard";
import { recipeRepository } from "../utils/recipeStorage";
import {
  ALL_CATEGORIES,
  RECIPE_CATEGORIES,
  RecipeFilter
} from "../utils/recipeHelpers";

const PAGE_SIZE = 9;
const CATEGORIES = [ALL_CATEGORIES, ...RECIPE_CATEGORIES];

function CommunityRecipesPage() {
  const [keyword, setKeyword] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allRecipes = useMemo(() => recipeRepository.getAll(), []);

  const filteredRecipes = useMemo(
    () =>
      RecipeFilter.apply(allRecipes, { keyword, ingredient, category }),
    [allRecipes, keyword, ingredient, category]
  );

  const visibleRecipes = filteredRecipes.slice(0, visibleCount);

  function updateFilter(setter) {
    return (value) => {
      setter(value);
      setVisibleCount(PAGE_SIZE);
    };
  }

  const changeKeyword = updateFilter(setKeyword);
  const changeIngredient = updateFilter(setIngredient);
  const changeCategory = updateFilter(setCategory);

  function handleReset() {
    setKeyword("");
    setIngredient("");
    setCategory(ALL_CATEGORIES);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="simple-home">
      <section className="simple-intro">
        <h1>Công thức cộng đồng</h1>

        <p>
          Tất cả công thức được chia sẻ trên Bếp Nhà,
          <br />
          từ các món có sẵn đến món do thành viên đăng.
        </p>
      </section>

      <section className="simple-search">
        <h2>Tìm kiếm công thức</h2>

        <input
          type="text"
          placeholder="Nhập tên món ăn..."
          value={keyword}
          onChange={(event) => changeKeyword(event.target.value)}
        />

        <input
          type="text"
          placeholder="Nhập nguyên liệu, ví dụ: thịt gà, trứng..."
          value={ingredient}
          onChange={(event) => changeIngredient(event.target.value)}
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
              onClick={() => changeCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="simple-recipes">
        <h2>Tất cả công thức</h2>

        <p>Có {filteredRecipes.length} công thức.</p>

        {filteredRecipes.length === 0 ? (
          <div className="simple-empty">
            <h3>Không tìm thấy công thức</h3>

            <p>Hãy thử tìm kiếm bằng tên món hoặc nguyên liệu khác.</p>

            <button type="button" onClick={handleReset}>
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="simple-recipe-list">
            {visibleRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {visibleCount < filteredRecipes.length && (
          <div className="load-more-wrap">
            <button
              type="button"
              className="load-more-button"
              onClick={() =>
                setVisibleCount((previous) => previous + PAGE_SIZE)
              }
            >
              Xem thêm
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default CommunityRecipesPage;    