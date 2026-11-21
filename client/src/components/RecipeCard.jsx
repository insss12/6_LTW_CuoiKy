import { Link } from "react-router-dom";

function RecipeCard({ recipe }) {
  return (
    <article className="recipe-card">

      <Link
        to={`/cong-thuc/${recipe.id}`}
        className="recipe-image-link"
      >
        <img
          src={recipe.image}
          alt={recipe.title}
          className="recipe-image"
          loading="lazy"
        />

        <span className="recipe-time">
          ◷ {recipe.time} phút
        </span>
      </Link>

      <div className="recipe-card-content">

        <span className="recipe-category">
          {recipe.category}
        </span>

        <Link to={`/cong-thuc/${recipe.id}`}>
          <h3>{recipe.title}</h3>
        </Link>

        <p className="recipe-description">
          {recipe.description}
        </p>

        <div className="recipe-card-meta">

          <span className="rating">
            ★ {recipe.rating}
          </span>

          <span className="review-count">
            ({recipe.reviewCount})
          </span>

          <span className="recipe-difficulty">
            {recipe.difficulty}
          </span>

        </div>

        <div className="recipe-author">
          Bởi {recipe.author}
        </div>

      </div>
    </article>
  );
}

export default RecipeCard;