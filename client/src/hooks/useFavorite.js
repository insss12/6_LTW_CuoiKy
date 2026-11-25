
import {
    useCallback,
    useEffect,
    useState
} from "react";

import useAuth from "./useAuth";
import { apiRequest } from "../services/api";

function useFavorite(recipeId) {
    const { user, token } = useAuth();

    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const isLoggedIn = Boolean(user?.id && token);

    // Lấy số tim và trạng thái yêu thích từ Server
    useEffect(() => {
        if (!recipeId) {
            setFavoriteCount(0);
            setIsFavorite(false);
            setIsLoading(false);
            return;
        }

        let active = true;

        async function loadFavorite() {
            setIsLoading(true);
            setError("");

            try {
                const key = encodeURIComponent(recipeId);

                // Tổng số tim: ai cũng xem được
                const countData = await apiRequest(
                    `/likes/${key}`
                );

                if (!active) return;

                setFavoriteCount(countData.likeCount || 0);

                // Nếu đăng nhập thì lấy trạng thái của tài khoản
                if (isLoggedIn) {
                    const statusData = await apiRequest(
                        `/likes/${key}/me`,
                        { token }
                    );

                    if (!active) return;

                    setIsFavorite(Boolean(statusData.liked));
                    setFavoriteCount(statusData.likeCount || 0);
                } else {
                    setIsFavorite(false);
                }
            } catch (requestError) {
                if (active) {
                    setError(
                        requestError.message ||
                        "Không tải được lượt thích."
                    );
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        loadFavorite();

        return () => {
            active = false;
        };
    }, [recipeId, token, isLoggedIn]);

    // Thả tim hoặc bỏ tim
    const toggle = useCallback(async () => {
        if (!isLoggedIn || !recipeId) {
            return null;
        }

        setIsLoading(true);
        setError("");

        try {
            const key = encodeURIComponent(recipeId);

            const data = await apiRequest(
                `/likes/${key}`,
                {
                    method: isFavorite ? "DELETE" : "PUT",
                    token
                }
            );

            setIsFavorite(Boolean(data.liked));
            setFavoriteCount(data.likeCount || 0);

            return Boolean(data.liked);
        } catch (requestError) {
            setError(
                requestError.message ||
                "Không thể cập nhật lượt thích."
            );

            return null;
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, recipeId, isFavorite, token]);

    return {
        isFavorite,
        favoriteCount,
        isLoading,
        error,
        toggle,
        isLoggedIn
    };
}

export default useFavorite;
