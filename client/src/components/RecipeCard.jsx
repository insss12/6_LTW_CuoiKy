import { Link } from "react-router-dom";

import FavoriteButton from "./FavoriteButton";
import RecipeImage from "./RecipeImage";

import useRecipeViews from "../hooks/useRecipeViews";

function RecipeCard({ recipe, onFavoriteChange }) {
    const {
        views
    } = useRecipeViews(recipe.id);

    return (
        <article className="simple-recipe-card">

            <div className="recipe-image-wrap">

                <Link to={`/cong-thuc/${recipe.id}`}>
                    <RecipeImage recipe={recipe} />
                </Link>

                <FavoriteButton
                    recipeId={recipe.id}
                    variant="card"
                    onToggle={onFavoriteChange}
                />

            </div>

            <div className="simple-recipe-info">

                <span>{recipe.category}</span>

                <h3>{recipe.title}</h3>

                <p>{recipe.description}</p>

                <p>
                    Thời gian: {recipe.time} phút ·{" "}
                    {recipe.difficulty}
                </p>

                <p className="recipe-stats">
                    👁 {views.toLocaleString("vi-VN")} lượt xem
                </p>

                <p>Bởi {recipe.author}</p>

                <Link to={`/cong-thuc/${recipe.id}`}>
                    Xem công thức
                </Link>

            </div>

        </article>
    );
}

export default RecipeCard;