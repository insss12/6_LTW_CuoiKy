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
