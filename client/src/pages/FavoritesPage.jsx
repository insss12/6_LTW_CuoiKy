
import {
    useEffect,
    useMemo,
    useState
} from "react";

import { Link } from "react-router-dom";

import RecipeCard from "../components/RecipeCard";
import useAuth from "../hooks/useAuth";

import { apiRequest, getErrorMessage } from "../services/api";
import { fetchRecipe } from "../services/recipeApi";

function FavoritesPage() {
    const { user, token } = useAuth();

    const [favoriteIds, setFavoriteIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [recipes, setRecipes] = useState([]);

    // Lấy danh sách đã thích từ MongoDB, rồi lấy thông tin từng công thức
    useEffect(() => {
        let active = true;

        async function loadFavorites() {
            setLoading(true);
            setError("");

            try {
                const result = await apiRequest(
                    "/favorites/mine",
                    { token }
                );

                const ids = result.items || [];

                const settled = await Promise.allSettled(
                    ids.map((recipeId) => fetchRecipe(recipeId, token))
                );

                if (active) {
                    setFavoriteIds(ids);
                    setRecipes(
                        settled
                            .filter((item) => item.status === "fulfilled")
                            .map((item) => item.value)
                    );
                }
            } catch (requestError) {
                if (active) {
                    setError(
                        getErrorMessage(requestError) ||
                        "Không tải được danh sách yêu thích."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        if (user && token) {
            loadFavorites();
        } else {
            setFavoriteIds([]);
            setRecipes([]);
            setLoading(false);
        }

        return () => {
            active = false;
        };
    }, [user, token]);

    // Giữ đúng thứ tự "mới thích nhất trước" của server
    const favorites = useMemo(
        () =>
            favoriteIds
                .map((id) => recipes.find((recipe) => recipe.id === id))
                .filter(Boolean),
        [favoriteIds, recipes]
    );

    function handleFavoriteChange(recipeId, liked) {
        if (!liked) {
            setFavoriteIds((current) =>
                current.filter((id) => id !== recipeId)
            );
        }
    }

    return (
        <div className="simple-home">
            <section className="simple-intro">
                <h1>Món yêu thích</h1>

                <p>
                    Những công thức bạn đã lưu lại
                    để nấu sau.
                </p>
            </section>

            <section className="simple-recipes">
                <h2>Công thức đã thích</h2>

                {loading ? (
                    <div className="simple-empty">
                        Đang tải danh sách...
                    </div>
                ) : error ? (
                    <div className="simple-empty">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <p>
                            Có {favoriteIds.length} lượt
                            thích của bạn.
                        </p>

                        {favorites.length === 0 ? (
                            <div className="simple-empty">
                                <h3>
                                    Bạn chưa có món yêu thích nào
                                </h3>

                                <p>
                                    Nhấn biểu tượng trái tim
                                    trên công thức để thêm vào
                                    danh sách.
                                </p>

                                <Link
                                    to="/cong-dong"
                                    className="load-more-button"
                                >
                                    Khám phá Cộng đồng
                                </Link>
                            </div>
                        ) : (
                            <div className="simple-recipe-list">
                                {favorites.map((recipe) => (
                                    <RecipeCard
                                        key={recipe.id}
                                        recipe={recipe}
                                        onFavoriteChange={
                                            handleFavoriteChange
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}

export default FavoritesPage;
