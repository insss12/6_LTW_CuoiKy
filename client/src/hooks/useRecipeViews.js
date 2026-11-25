import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const API_DEFAULT = {
    viewCount: 0
};

function makeId() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return (
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2) +
        "-" +
        Math.random().toString(36).slice(2)
    );
}

// Tạo ID cho trình duyệt và phiên hiện tại
function getSessionIdentity() {
    let visitorId;
    let sessionId;

    try {
        visitorId = localStorage.getItem("bepnha_visitor_id");

        if (!visitorId) {
            visitorId = makeId();

            localStorage.setItem(
                "bepnha_visitor_id",
                visitorId
            );
        }
    } catch {
        visitorId = makeId();
    }

    try {
        sessionId = sessionStorage.getItem("bepnha_session_id");

        if (!sessionId) {
            sessionId = makeId();

            sessionStorage.setItem(
                "bepnha_session_id",
                sessionId
            );
        }
    } catch {
        sessionId = makeId();
    }

    return {
        visitorId,
        sessionId
    };
}

// Hook quản lý lượt xem
export default function useRecipeViews(
    recipeKey,
    { recordView = false } = {}
) {
    const [views, setViews] = useState(0);

    const [loading, setLoading] = useState(
        Boolean(recipeKey)
    );

    const [error, setError] = useState("");

    useEffect(() => {
        if (!recipeKey) {
            setViews(0);
            setLoading(false);
            return;
        }

        let active = true;

        async function loadViews() {
            setLoading(true);
            setError("");

            try {
                let result;

                if (recordView) {
                    const identity = getSessionIdentity();

                    result = await apiRequest(
                        `/views/${encodeURIComponent(recipeKey)}`,
                        {
                            method: "POST",
                            body: identity
                        }
                    );
                } else {
                    result = await apiRequest(
                        `/views/${encodeURIComponent(recipeKey)}`
                    );
                }

                if (active) {
                    setViews(result.viewCount || 0);
                }
            } catch (requestError) {
                if (active) {
                    setError(
                        requestError.message ||
                        "Không tải được lượt xem."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadViews();

        return () => {
            active = false;
        };
    }, [recipeKey, recordView]);

    return {
        views,
        loading,
        error
    };
}