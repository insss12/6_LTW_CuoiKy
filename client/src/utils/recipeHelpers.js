export const ALL_CATEGORIES = "Tất cả";

export const RECIPE_CATEGORIES = [
  "Món chính",
  "Món nước",
  "Món chay",
  "Ăn sáng",
  "Món khai vị",
  "Tráng miệng"
];

export class RecipeFormatter {
  static ingredientName(item) {
    return typeof item === "string" ? item : item?.name || "";
  }

  static ingredientAmount(item) {
    if (typeof item === "string") {
      return "";
    }

    return [item?.quantity, item?.unit].filter(Boolean).join(" ");
  }

  static stepText(step) {
    return typeof step === "string" ? step : step?.instruction || "";
  }
}

export class RecipeFilter {
  static normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  }

  static parseIngredients(text) {
    return String(text || "")
      .split(",")
      .map((item) => RecipeFilter.normalize(item.trim()))
      .filter((item) => item !== "");
  }

  static countMatches(recipe, wanted) {
    const names = (recipe.ingredients || []).map((item) =>
      RecipeFilter.normalize(RecipeFormatter.ingredientName(item))
    );

    return wanted.filter((item) =>
      names.some((name) => name.includes(item))
    ).length;
  }

  static apply(
    recipes,
    { keyword = "", ingredient = "", category = ALL_CATEGORIES }
  ) {
    const searchName = RecipeFilter.normalize(keyword.trim());
    const wanted = RecipeFilter.parseIngredients(ingredient);

    return recipes
      .map((recipe) => ({
        recipe,
        matched: RecipeFilter.countMatches(recipe, wanted)
      }))
      .filter(({ recipe, matched }) => {
        const matchName = RecipeFilter.normalize(recipe.title).includes(
          searchName
        );

        const matchCategory =
          category === ALL_CATEGORIES || recipe.category === category;

        const matchIngredient = wanted.length === 0 || matched > 0;

        return matchName && matchCategory && matchIngredient;
      })
      .sort((a, b) => b.matched - a.matched)
      .map(({ recipe }) => recipe);
  }
}