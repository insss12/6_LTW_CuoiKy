import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "../services/api";
import { fetchRecipes } from "../services/recipeApi";

// Danh sách công thức công khai, lọc và phân trang ở server.
// filters: { q, category, difficulty, maxTime, sort } (category là _id loại món)
function useRecipeList(filters = {}, { limit = 12 } = {}) {
  const { q = "", category = "", difficulty = "", maxTime = "", sort = "" } = filters;

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  // Đổi bộ lọc thì tải lại từ trang 1
  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchRecipes({
          q, category, difficulty, maxTime, sort, page: 1, limit
        });

        if (active) {
          setItems(data.items);
          setPagination(data.pagination);
        }
      } catch (requestError) {
        if (active) {
          setItems([]);
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [q, category, difficulty, maxTime, sort, limit]);

  const hasMore = pagination.page < pagination.totalPages;

  // Tải trang kế tiếp và nối vào cuối danh sách
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    setLoadingMore(true);

    try {
      const data = await fetchRecipes({
        q, category, difficulty, maxTime, sort, page: pagination.page + 1, limit
      });

      setItems((current) => [...current, ...data.items]);
      setPagination(data.pagination);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, q, category, difficulty, maxTime, sort, limit, pagination.page]);

  return {
    items,
    total: pagination.total,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore
  };
}

export default useRecipeList;
