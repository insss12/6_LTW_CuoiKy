import { useCallback, useEffect, useState } from "react";
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

import { RecipeFormatter } from "../utils/recipeHelpers";
import { ApiError, getErrorMessage } from "../services/api";
import { fetchRecipe, STATUS_LABELS } from "../services/recipeApi";

import useAuth from "../hooks/useAuth";
import useRecipeViews from "../hooks/useRecipeViews";

function RecipeDetailPage() {
    const { id } = useParams();

    const navigate = useNavigate();
    const location = useLocation();
    const { token, loading: authLoading } = useAuth();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Điểm trung bình: lấy từ công thức, sau đó được ReviewSection cập nhật
    const [summary, setSummary] = useState({ average: 0, count: 0 });

    // Lấy công thức từ server (đợi AuthContext khôi phục đăng nhập xong để
    // chủ món/Admin xem được món chưa duyệt)
    useEffect(() => {
        if (authLoading) {
            return;
        }

        let active = true;

        async function loadRecipe() {
            setLoading(true);
            setError("");

            try {
                const data = await fetchRecipe(id, token);

                if (active) {
                    setRecipe(data);
                    setSummary({
                        average: data.ratingAvg || 0,
                        count: data.ratingCount || 0
                    });
                }
            } catch (requestError) {
                if (active) {
                    setRecipe(null);
                    setError(
                        requestError instanceof ApiError && requestError.status === 404
                            ? ""
                            : getErrorMessage(requestError)
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadRecipe();

        return () => {
            active = false;
        };
    }, [id, token, authLoading]);

    // Chỉ món đã duyệt mới có lượt xem, tim và đánh giá
    const isApproved = recipe?.status === "approved";

    const { views } = useRecipeViews(
        isApproved ? recipe.id : "",
        { recordView: true }
    );

    const handleSummary = useCallback((next) => {
        setSummary({
            average: next.average || 0,
            count: next.count || 0
        });
    }, []);

    function handleBack() {
        if (location.key !== "default") {
            navigate(-1);
            return;
        }

        navigate("/");
    }

    if (loading || authLoading) {
        return (
            <div className="not-found">
                <p>Đang tải công thức...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="not-found">
                <h2>Không tải được công thức</h2>

                <p>{error}</p>

                <Link to="/" className="header-button">
                    Quay về trang chủ
                </Link>
            </div>
        );
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

                {!isApproved && (
                    <p className="form-message" role="status">
                        Trạng thái: {STATUS_LABELS[recipe.status] || recipe.status}.
                        {recipe.status === "rejected" && recipe.rejectionReason
                            ? ` Lý do: ${recipe.rejectionReason}`
                            : " Công thức chỉ hiển thị công khai sau khi được Admin duyệt."}
                    </p>
                )}

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
                                        {Number(summary.average).toFixed(1)}
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

                            {isApproved && (
                                <span>
                                    👁 {views.toLocaleString("vi-VN")} lượt xem
                                </span>
                            )}

                        </div>

                        {isApproved && (
                            <div className="detail-actions">
                                <FavoriteButton
                                    recipeId={recipe.id}
                                    variant="detail"
                                />
                            </div>
                        )}

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

                {isApproved && (
                    <ReviewSection
                        recipe={recipe}
                        onSummary={handleSummary}
                    />
                )}

                <div className="detail-bottom">
                    Chúc bạn có một bữa ăn thật ngon! ♡
                </div>

            </div>
        </div>
    );
}

export default RecipeDetailPage;