const STORAGE_KEY = "bepnha_my_recipes";

export function getMyRecipes() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Không thể đọc dữ liệu:", error);
    return [];
  }
}
    
export function saveMyRecipes(recipes) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(recipes)
  );
}