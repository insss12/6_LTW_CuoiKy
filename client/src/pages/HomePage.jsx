
import { useState } from "react";
import recipes from "../data/recipes.js";

function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [category, setCategory] = useState("Tất cả");

  const categories = [
    "Tất cả",
    "Món chính",
    "Món nước",
    "Món chay",
    "Ăn sáng",
    "Món khai vị",
    "Tráng miệng"
  ];

  // Loại bỏ dấu tiếng Việt để tìm kiếm dễ hơn
  function removeAccents(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  }

  // Lọc công thức theo tên, nguyên liệu và danh mục
  const filteredRecipes = recipes
    .map((recipe) => {
      const ingredientList = ingredient
        .split(",")
        .map((item) => removeAccents(item.trim()))
        .filter((item) => item !== "");

      const matchedCount = ingredientList.filter((item) =>
        recipe.ingredients.some((name) =>
          removeAccents(name).includes(item)
        )
      ).length;

      return {
        ...recipe,
        matchedCount
      };
    })
    .filter((recipe) => {
      const recipeName = removeAccents(recipe.title);
      const searchName = removeAccents(keyword);

      const matchName = recipeName.includes(searchName);

      const matchCategory =
        category === "Tất cả" ||
        recipe.category === category;

      const matchIngredient =
        ingredient.trim() === "" ||
        recipe.matchedCount > 0;

      return (
        matchName &&
        matchCategory &&
        matchIngredient
      );
    })
    .sort((a, b) => b.matchedCount - a.matchedCount);

  // Xóa các điều kiện tìm kiếm
  function handleReset() {
    setKeyword("");
    setIngredient("");
    setCategory("Tất cả");
  }

  return (
    <div className="simple-home">

      {/* PHẦN GIỚI THIỆU */}
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

      {/* PHẦN TÌM KIẾM */}
      <section className="simple-search">

        <h2>Tìm kiếm món ăn</h2>

        <input
          type="text"
          placeholder="Nhập tên món ăn..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <input
          type="text"
          placeholder="Nhập nguyên liệu, ví dụ: thịt gà, trứng..."
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
        />

        <button
          type="button"
          onClick={handleReset}
        >
          Xóa tìm kiếm
        </button>

      </section>

      {/* PHẦN DANH MỤC */}
      <section className="simple-category">

        <h2>Danh mục món ăn</h2>

        <div className="simple-category-list">

          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={
                category === item ? "selected" : ""
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}

        </div>

      </section>

      {/* DANH SÁCH CÔNG THỨC */}
      <section
        className="simple-recipes"
        id="cong-thuc"
      >

        <h2>Các công thức nấu ăn</h2>

        <p>
          Hiện có {filteredRecipes.length} công thức.
        </p>

        {recipes.length === 0 ? (

          <div className="simple-empty">
            <h3>Chưa có công thức nấu ăn</h3>

            <p>
              Các công thức sẽ được cập nhật trong thời gian tới.
            </p>
          </div>

        ) : filteredRecipes.length === 0 ? (

          <div className="simple-empty">
            <h3>Không tìm thấy món ăn</h3>

            <p>
              Hãy thử tìm kiếm bằng tên món hoặc nguyên liệu khác.
            </p>

            <button
              type="button"
              onClick={handleReset}
            >
              Xóa bộ lọc
            </button>
          </div>

        ) : (

          <div className="simple-recipe-list">

            {filteredRecipes.map((recipe) => (

              <article
                className="simple-recipe-card"
                key={recipe.id}
              >

                <img
                  src={recipe.image}
                  alt={recipe.title}
                />

                <div className="simple-recipe-info">

                  <span>{recipe.category}</span>

                  <h3>{recipe.title}</h3>

                  <p>{recipe.description}</p>

                  <p>
                    Thời gian: {recipe.time} phút
                  </p>

                  <a href={`/cong-thuc/${recipe.id}`}>
                    Xem công thức
                  </a>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default HomePage;
