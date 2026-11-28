import { useEffect, useState } from "react";

import { getErrorMessage } from "../services/api";
import { fetchCategories } from "../services/recipeApi";

// Lấy danh sách loại món từ server: [{ id, name, description }]
function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const items = await fetchCategories();

        if (active) {
          setCategories(items);
        }
      } catch (requestError) {
        if (active) {
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
  }, []);

  return { categories, loading, error };
}

export default useCategories;
