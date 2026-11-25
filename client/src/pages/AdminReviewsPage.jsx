
import { useCallback, useEffect, useState } from "react";

import useAuth from "../hooks/useAuth";
import { apiRequest } from "../services/api";

function formatDate(value) {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleString("vi-VN");
}

const STATUS_LABELS = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    hidden: "Đã ẩn"
};

function AdminReviewsPage() {
    const { token } = useAuth();

    const [status, setStatus] = useState("pending");
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [processingId, setProcessingId] = useState("");

    const loadReviews = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const result = await apiRequest(
                `/admin/reviews?status=${status}&page=1&limit=50`,
                { token }
            );

            setReviews(result.items || []);
        } catch (requestError) {
            setError(
                requestError.message ||
                "Không tải được danh sách bình luận."
            );
        } finally {
            setLoading(false);
        }
    }, [status, token]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    async function handleAction(reviewId, action) {
        let confirmMessage = "";

        if (action === "delete") {
            confirmMessage = "Bạn có chắc muốn xóa bình luận này?";
        }

        if (
            confirmMessage &&
            !window.confirm(confirmMessage)
        ) {
            return;
        }

        setProcessingId(reviewId);
        setError("");
        setMessage("");

        try {
            let path = `/admin/reviews/${reviewId}`;
            let method = "DELETE";

            if (action === "approve") {
                path += "/approve";
                method = "PATCH";
            }

            if (action === "hide") {
                path += "/hide";
                method = "PATCH";
            }

            const result = await apiRequest(path, {
                method,
                token
            });

            setMessage(result.message || "Đã cập nhật bình luận.");

            await loadReviews();
        } catch (requestError) {
            setError(
                requestError.message ||
                "Không thực hiện được thao tác."
            );
        } finally {
            setProcessingId("");
        }
    }

    return (
        <main className="admin-review-page">
            <div className="admin-review-container">
                <header className="admin-review-heading">
                    <span className="admin-review-eyebrow">
                        QUẢN TRỊ BẾP NHÀ
                    </span>

                    <h1>Kiểm duyệt bình luận</h1>

                    <p>
                        Quản lý nhận xét của thành viên trước
                        khi hiển thị công khai.
                    </p>
                </header>

                <div className="admin-review-tabs">
                    <button
                        type="button"
                        className={status === "pending" ? "active" : ""}
                        onClick={() => setStatus("pending")}
                    >
                        Chờ duyệt
                    </button>

                    <button
                        type="button"
                        className={status === "approved" ? "active" : ""}
                        onClick={() => setStatus("approved")}
                    >
                        Đã duyệt
                    </button>

                    <button
                        type="button"
                        className={status === "hidden" ? "active" : ""}
                        onClick={() => setStatus("hidden")}
                    >
                        Đã ẩn
                    </button>
                </div>

                {message && (
                    <p className="admin-review-message">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="admin-review-error">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="admin-review-empty">
                        Đang tải dữ liệu...
                    </p>
                ) : reviews.length === 0 ? (
                    <div className="admin-review-empty">
                        Không có bình luận nào ở mục này.
                    </div>
                ) : (
                    <div className="admin-review-list">
                        {reviews.map((review) => (
                            <article
                                className="admin-review-card"
                                key={review.id}
                            >
                                <div className="admin-review-card-head">
                                    <div>
                                        <strong>
                                            {review.userName}
                                        </strong>

                                        <small>
                                            Công thức: {review.recipeKey}
                                        </small>
                                    </div>

                                    <span className={`admin-review-status ${review.status}`}>
                                        {STATUS_LABELS[review.status]}
                                    </span>
                                </div>

                                <div className="admin-review-rating">
                                    {"★".repeat(review.rating)}
                                    {"☆".repeat(5 - review.rating)}
                                </div>

                                <p className="admin-review-comment">
                                    {review.comment}
                                </p>

                                <small className="admin-review-date">
                                    Gửi lúc: {formatDate(review.createdAt)}
                                </small>

                                <div className="admin-review-actions">
                                    {review.status !== "approved" && (
                                        <button
                                            type="button"
                                            className="admin-approve-button"
                                            disabled={processingId === review.id}
                                            onClick={() =>
                                                handleAction(review.id, "approve")
                                            }
                                        >
                                            Duyệt bình luận
                                        </button>
                                    )}

                                    {review.status !== "hidden" && (
                                        <button
                                            type="button"
                                            className="admin-hide-button"
                                            disabled={processingId === review.id}
                                            onClick={() =>
                                                handleAction(review.id, "hide")
                                            }
                                        >
                                            Ẩn bình luận
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="admin-delete-button"
                                        disabled={processingId === review.id}
                                        onClick={() =>
                                            handleAction(review.id, "delete")
                                        }
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default AdminReviewsPage;
