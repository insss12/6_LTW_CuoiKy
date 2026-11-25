import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { apiRequest } from "../services/api";

function AdminCommentsPage() {
  const { token } = useAuth();
  const [comments, setComments] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [workingId, setWorkingId] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiRequest(`/admin/comments?status=${status}`, { token });
      setComments(result.comments || []);
    } catch (error) {
      setMessage(error.message || "Không tải được bình luận.");
    } finally {
      setLoading(false);
    }
  }, [status, token]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function moderate(commentId, nextStatus) {
    setWorkingId(commentId);
    setMessage("");
    try {
      const result = await apiRequest(`/admin/comments/${commentId}`, {
        method: "PATCH",
        token,
        body: { status: nextStatus }
      });
      setMessage(result.message || "Đã cập nhật trạng thái.");
      await loadComments();
    } catch (error) {
      setMessage(error.message || "Không cập nhật được trạng thái.");
    } finally {
      setWorkingId("");
    }
  }

  return (
    <div className="admin-comments-page">
      <div className="admin-comments-heading">
        <div>
          <span className="admin-eyebrow">BẾP NHÀ · QUẢN TRỊ</span>
          <h1>Kiểm duyệt bình luận</h1>
          <p>Chỉ những bình luận được duyệt mới xuất hiện trên trang công thức.</p>
        </div>
        <Link to="/" className="admin-back-link">← Về trang chủ</Link>
      </div>

      <div className="admin-comment-filters">
        <button className={status === "pending" ? "active" : ""} onClick={() => { setMessage(""); setStatus("pending"); }}>Chờ duyệt</button>
        <button className={status === "approved" ? "active" : ""} onClick={() => { setMessage(""); setStatus("approved"); }}>Đã duyệt</button>
        <button className={status === "rejected" ? "active" : ""} onClick={() => { setMessage(""); setStatus("rejected"); }}>Đã từ chối</button>
      </div>

      {message && <p className="admin-comment-message">{message}</p>}
      {loading ? <p>Đang tải bình luận...</p> : comments.length === 0 ? (
        <div className="admin-comments-empty">Không có bình luận ở trạng thái này.</div>
      ) : (
        <div className="admin-comment-list">
          {comments.map((item) => (
            <article className="admin-comment-card" key={item.id}>
              <div className="admin-comment-card-head">
                <div>
                  <strong>{item.recipeTitle || item.recipeKey}</strong>
                  <small>Mã món: {item.recipeKey}</small>
                </div>
                <span className={`admin-comment-status ${item.status}`}>{item.status}</span>
              </div>
              <div className="admin-comment-author">
                {item.userName} {item.userEmail ? `· ${item.userEmail}` : ""} · {new Date(item.createdAt).toLocaleString("vi-VN")}
              </div>
              <div className="admin-comment-rating">{ "★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</div>
              <p>{item.comment}</p>
              {status === "pending" && (
                <div className="admin-comment-actions">
                  <button disabled={workingId === item.id} onClick={() => moderate(item.id, "approved")}>Duyệt bình luận</button>
                  <button disabled={workingId === item.id} className="reject" onClick={() => moderate(item.id, "rejected")}>Từ chối</button>
                </div>
              )}
              {status === "rejected" && (
                <div className="admin-comment-actions">
                  <button disabled={workingId === item.id} onClick={() => moderate(item.id, "approved")}>Duyệt lại</button>
                </div>
              )}
              {workingId === item.id && <small>Đang cập nhật...</small>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCommentsPage;
