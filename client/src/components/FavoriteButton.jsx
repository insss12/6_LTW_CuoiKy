
import {
    useLocation,
    useNavigate
} from "react-router-dom";

import useFavorite from "../hooks/useFavorite";
import useAuth from "../hooks/useAuth";

function FavoriteButton({
    recipeId,
    variant = "card",
    onToggle
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const { loading: authLoading } = useAuth();

    const {
        isFavorite,
        favoriteCount,
        isLoading,
        error,
        toggle,
        isLoggedIn
    } = useFavorite(recipeId);

    async function handleClick(event) {
        event.preventDefault();
        event.stopPropagation();

        if (authLoading) return;

        if (!isLoggedIn) {
            navigate("/dang-nhap", {
                state: { from: location }
            });

            return;
        }

        const next = await toggle();

        // null nghĩa là API gặp lỗi
        if (next !== null && onToggle) {
            onToggle(recipeId, next);
        }
    }

    const label = isFavorite
        ? "Bỏ thích công thức"
        : "Thích công thức";

    return (
        <button
            type="button"
            className={
                `favorite-button ${variant}` +
                (isFavorite ? " active" : "")
            }
            aria-pressed={isFavorite}
            aria-label={`${label}. ${favoriteCount} lượt thích`}
            title={
                error ||
                (isLoggedIn
                    ? label
                    : "Đăng nhập để thích công thức")
            }
            onClick={handleClick}
            disabled={isLoading || authLoading}
        >
            <span
                className="favorite-heart"
                aria-hidden="true"
            >
                {isFavorite ? "♥" : "♡"}
            </span>

            <span className="favorite-count">
                {favoriteCount.toLocaleString("vi-VN")}
            </span>

            {variant === "detail" && (
                <span>
                    {isFavorite ? "Đã thích" : "Yêu thích"}
                </span>
            )}
        </button>
    );
}

export default FavoriteButton;
