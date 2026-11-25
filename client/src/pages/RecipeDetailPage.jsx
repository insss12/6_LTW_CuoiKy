import { useMemo } from "react";
import {
    Link,
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import FavoriteButton from "../components/FavoriteButton";
import RecipeImage from "../components/RecipeImage";
import ReviewSection from "../components/ReviewSection";
import StarRating from "../components/StarRating";

import "../styles/detail.css";
import "../styles/Community.css";

import { recipeRepository } from "../utils/recipeStorage";
import { RecipeFormatter } from "../utils/recipeHelpers";
import { reviewRepository } from "../utils/recipeInteractions";

import useRecipeViews from "../hooks/useRecipeViews";

function RecipeDetailPage() {
    const { id } = useParams();

    const navigate = useNavigate();
    const location = useLocation();

    // Lấy công thức
    const recipe = useMemo(
        () => recipeRepository.findById(id),
        [id]
    );

    // Lượt xem được lưu trên Server
    const {
        views
    } = useRecipeViews(
        recipe ? id : "",
        {
            recordView: true
        }
    );

    // Phần đánh giá cũ, sẽ chuyển sang bình luận Server ở phần tiếp theo
    const summary = useMemo(
        () =>
            recipe
                ? reviewRepository.summary(recipe)
                : {
                    average: 0,
                    count: 0
                },
        [recipe]
    );

    function handleBack() {
        if (location.key !== "default") {
            navigate(-1);
            return;
        }

        navigate("/");
    }

    if (!recipe) {
        return (
            <div className="not-found">
                <span>404</span>

                <h2>Không tìm thấy công thức</h2>

                <p>
                    Công thức này có thể đã bị xóa
                    hoặc không tồn tại.
                </p>

                <Link to="/" className="header-button">
                    Quay về trang chủ
                </Link>
            </div>
        );
    }

    return (
        <div className="detail-page">
            <div className="detail-container">

                <button
                    type="button"
                    className="back-link"
                    onClick={handleBack}
                >
                    ← Quay lại
                </button>

                <div className="detail-hero">

                    <RecipeImage
                        recipe={recipe}
                        placeholderClassName="detail-placeholder"
                    />

                    <div className="detail-intro">

                        <span className="recipe-category">
                            {recipe.category}
                        </span>

                        <h1>{recipe.title}</h1>

                        <p>{recipe.description}</p>

                        <div className="detail-rating">

                            {summary.count > 0 ? (
                                <>
                                    <StarRating
                                        value={summary.average}
                                    />

                                    <span>
                                        {summary.average}
                                    </span>

                                    <span>
                                        {summary.count} lượt đánh giá
                                    </span>
                                </>
                            ) : (
                                <span>
                                    Chưa có đánh giá
                                </span>
                            )}

                            <span>
                                👁 {views.toLocaleString("vi-VN")} lượt xem
                            </span>

                        </div>

                        <div className="detail-actions">
                            <FavoriteButton
                                recipeId={recipe.id}
                                variant="detail"
                            />
                        </div>

                        <div className="detail-meta">

                            <div>
                                <span>◷</span>

                                <strong>
                                    {recipe.time} phút
                                </strong>

                                <small>Thời gian</small>
                            </div>

                            <div>
                                <span>♨</span>

                                <strong>
                                    {recipe.difficulty}
                                </strong>

                                <small>Độ khó</small>
                            </div>

                            <div>
                                <span>♧</span>

                                <strong>
                                    {recipe.servings} người
                                </strong>

                                <small>Khẩu phần</small>
                            </div>

                        </div>

                        <p className="detail-author">
                            Công thức từ{" "}
                            <strong>{recipe.author}</strong>
                        </p>

                    </div>
                </div>

                <div className="detail-content">

                    <section className="detail-ingredients">

                        <div className="detail-section-title">
                            <span>01</span>
                            <h2>Nguyên liệu</h2>
                        </div>

                        <p className="detail-subtitle">
                            Chuẩn bị nguyên liệu cho{" "}
                            {recipe.servings} người.
                        </p>

                        <ul className="ingredient-list">

                            {recipe.ingredients.map(
                                (ingredient, index) => {
                                    const amount =
                                        RecipeFormatter.ingredientAmount(
                                            ingredient
                                        );

                                    return (
                                        <li
                                            key={`${recipe.id}-ingredient-${index}`}
                                        >
                                            <span className="ingredient-check">
                                                ✓
                                            </span>

                                            {RecipeFormatter.ingredientName(
                                                ingredient
                                            )}

                                            {amount
                                                ? ` - ${amount}`
                                                : ""}
                                        </li>
                                    );
                                }
                            )}

                        </ul>

                    </section>

                    <section className="detail-steps">

                        <div className="detail-section-title">
                            <span>02</span>
                            <h2>Các bước thực hiện</h2>
                        </div>

                        <p className="detail-subtitle">
                            Thực hiện lần lượt theo hướng dẫn.
                        </p>

                        <div className="steps-list">

                            {recipe.steps.map(
                                (step, index) => (
                                    <article
                                        className="step-item"
                                        key={`${recipe.id}-step-${index}`}
                                    >
                                        <span className="step-number">
                                            {index + 1}
                                        </span>

                                        <p>
                                            {RecipeFormatter.stepText(step)}
                                        </p>
                                    </article>
                                )
                            )}

                        </div>

                    </section>

                </div>

                <ReviewSection
                    recipe={recipe}
                />

                <div className="detail-bottom">
                    Chúc bạn có một bữa ăn thật ngon! ♡
                </div>

            </div>
        </div>
    );
}

export default RecipeDetailPage;