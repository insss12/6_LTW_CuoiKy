import sampleRecipes from "../data/recipes.js";

const STORAGE_KEY = "bepnha_my_recipes";

class RecipeRepository {
  constructor(storageKey, samples) {
    this.storageKey = storageKey;
    this.samples = samples;
  }

  getMine() {
    try {
      const data = window.localStorage.getItem(this.storageKey);
      const parsed = data ? JSON.parse(data) : [];

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveMine(recipes) {
    try {
      window.localStorage.setItem(
        this.storageKey,
        JSON.stringify(recipes)
      );

      return true;
    } catch {
      return false;
    }
  }

  findMine(id) {
    return this.getMine().find((recipe) => recipe.id === id) || null;
  }

  getSamples() {
    return [...this.samples];
  }

  getAll() {
    const mine = this.getMine().sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
    );

    return [...mine, ...this.samples];
  }

  findById(id) {
    return this.getAll().find((recipe) => recipe.id === id) || null;
  }
}

export const recipeRepository = new RecipeRepository(
  STORAGE_KEY,
  sampleRecipes
);