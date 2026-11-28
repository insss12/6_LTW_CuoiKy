
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import StarRating from "./StarRating";
import { apiRequest } from "../services/api";

const MAX_COMMENT_LENGTH = 500;

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("vi-VN");
}

function ReviewSection({ recipe, onChanged, onSummary }) {
    const { user, token } = useAuth();
    const location = useLocation();

    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({
        average: 0,
        count: 0
    });

    const [myReview, setMyReview] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const recipeKey = recipe.id;

    // Tải bình luận đã duyệt và nhận xét riêng của tài khoản
    const loadReviews = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const key = encodeURIComponent(recipeKey);

            const publicData = await apiRequest(
                `/reviews/${key}`
            );

            setReviews(publicData.items || []);
            setSummary(
                publicData.summary || {
                    average: 0,
                    count: 0
                }
            );

            let mine = null;

            if (user?.id && token) {
                const mineData = await apiRequest(
                    `/reviews/${key}/mine`,
                    { token }
                );

                mine = mineData.review || null;
            }

            setMyReview(mine);
            setRating(mine?.rating || 0);
            setComment(mine?.comment || "");
        } catch (requestError) {
            setError(
                requestError.message ||
                "Không tải được nhận xét."
            );
        } finally {
            setLoading(false);
        }
    }, [recipeKey, user?.id, token]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    // Báo điểm trung bình lên trang chi tiết để hai nơi luôn khớp nhau
    useEffect(() => {
        if (!loading && onSummary) {
            onSummary(summary);
        }
    }, [loading, summary, onSummary]);

    // Gửi hoặc cập nhật nhận xét
    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!token || !user) {
            setError("Vui lòng đăng nhập để gửi nhận xét.");
            return;
        }

        if (rating < 1 || rating > 5) {
            setError("Vui lòng chọn số sao từ 1 đến 5.");
            return;
        }

        if (comment.trim().length < 3) {
            setError("Nhận xét cần có ít nhất 3 ký tự.");
            return;
        }

        if (comment.trim().length > MAX_COMMENT_LENGTH) {
            setError("Nhận xét không được vượt quá 500 ký tự.");
            return;
        }

        setSubmitting(true);

        try {
            const key = encodeURIComponent(recipeKey);

            const result = await apiRequest(
                `/reviews/${key}`,
                {
                    method: "POST",
                    token,
                    body: {
                        rating,
                        comment: comment.trim()
                    }
                }
            );

            setMyReview(result.review);
            setMessage(
                "Đã gửi nhận xét. Nội dung đang chờ Admin kiểm duyệt."
            );

            await loadReviews();

            if (onChanged) {
                onChanged();
            }
        } catch (requestError) {
            setError(
                requestError.message ||
                "Không gửi được nhận xét."
            );
        } finally {
            setSubmitting(false);
        }
    }

    // Xóa nhận xét của bản thân
    async function handleDelete() {
        const confirmed = window.confirm(
            "Bạn có chắc muốn xóa nhận xét của mình?"
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");

        try {
            const key = encodeURIComponent(recipeKey);

            await apiRequest(
                `/reviews/${key}`,
                {
                    method: "DELETE",
                    token
                }
            );

            setMyReview(null);
            setRating(0);
            setComment("");
            setMessage("Đã xóa nhận xét.");

            await loadReviews();

            if (onChanged) {
                onChanged();
            }
        } catch (requestError) {
            setError(
                requestError.message ||
                "Không thể xóa nhận xét."
            );
        }
    }

    return (
        <section className="review-section">
            <h2>
                Nhận xét ({summary.count})
            </h2>

            <div className="review-summary">
                <strong>
                    {summary.average > 0
                        ? `${summary.average}/5`
                        : "Chưa có đánh giá"}
                </strong>

                {summary.count > 0 && (
                    <span>
                        Được đánh giá bởi {summary.count} thành viên
                    </span>
                )}
            </div>

            {user ? (
                <form
                    className="review-form"
                    onSubmit={handleSubmit}
                >
                    <label>
                        {myReview
                            ? "Nhận xét của bạn"
                            : "Viết nhận xét của bạn"}
                    </label>

                    <StarRating
                        value={rating}
                        onChange={setRating}
                    />

                    <textarea
                        rows="4"
                        maxLength={MAX_COMMENT_LENGTH}
                        value={comment}
                        onChange={(event) =>
                            setComment(event.target.value)
                        }
                        placeholder="Chia sẻ cảm nhận của bạn về món ăn này..."
                        disabled={submitting}
                    />

                    <small className="review-character-count">
                        {comment.length}/{MAX_COMMENT_LENGTH} ký tự
                    </small>

                    {myReview?.status === "pending" && (
                        <p className="review-pending">
                            Nhận xét của bạn đang chờ Admin kiểm duyệt.
                        </p>
                    )}

                    {myReview?.status === "hidden" && (
                        <p className="review-hidden">
                            Nhận xét trước đó đã bị ẩn. Bạn có thể chỉnh sửa
                            và gửi lại để Admin kiểm duyệt.
                        </p>
                    )}

                    {myReview?.status === "approved" && (
                        <p className="review-approved">
                            Nhận xét của bạn đã được duyệt và đang hiển thị.
                        </p>
                    )}

                    {message && (
                        <p className="form-message">
                            {message}
                        </p>
                    )}

                    {error && (
                        <p className="form-message error">
                            {error}
                        </p>
                    )}

                    <div className="review-form-actions">
                        <button
                            type="submit"
                            className="save-recipe-button"
                            disabled={submitting}
                        >
                            {submitting
                                ? "Đang gửi..."
                                : myReview
                                    ? "Cập nhật nhận xét"
                                    : "Gửi nhận xét"}
                        </button>

                        {myReview && (
                            <button
                                type="button"
                                className="delete-button review-delete"
                                onClick={handleDelete}
                                disabled={submitting}
                            >
                                Xóa nhận xét
                            </button>
                        )}
                    </div>
                </form>
            ) : (
                <p className="review-login-note">
                    <Link
                        to="/dang-nhap"
                        state={{ from: location }}
                    >
                        Đăng nhập
                    </Link>{" "}
                    để viết nhận xét và đánh giá món ăn.
                </p>
            )}

            <div className="review-public-list">
                <h3>Nhận xét đã được duyệt</h3>

                {loading ? (
                    <p className="review-empty">
                        Đang tải nhận xét...
                    </p>
                ) : reviews.length === 0 ? (
                    <p className="review-empty">
                        Chưa có nhận xét nào được duyệt cho món này.
                    </p>
                ) : (
                    <ul className="review-list">
                        {reviews.map((review) => (
                            <li
                                key={review.id}
                                className="review-item"
                            >
                                <div className="review-item-head">
                                    <strong>
                                        {review.userName}
                                    </strong>

                                    {review.userId === user?.id && (
                                        <span className="review-mine">
                                            Của bạn
                                        </span>
                                    )}

                                    <StarRating
                                        value={review.rating}
                                    />

                                    <small>
                                        {formatDate(review.createdAt)}
                                    </small>
                                </div>

                                <p>{review.comment}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

export default ReviewSection;
