import { useEffect, useState } from "react";

function RecipeImage({ recipe, placeholderClassName = "recipe-placeholder" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [recipe.image]);

  if (!recipe.image || failed) {
    return (
      <div className={placeholderClassName}>
        {recipe.emoji || "🍲"}
      </div>
    );
  }

  return (
    <img
      src={recipe.image}
      alt={recipe.title}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default RecipeImage;