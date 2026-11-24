import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate
} from "react-router-dom";

import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Quay lại trang người dùng định vào trước khi bị chuyển sang đăng nhập
  const redirectTo = location.state?.from?.pathname || "/";

  // Đã đăng nhập rồi thì không cần ở trang này
  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>

        <p>Đăng nhập để sử dụng các chức năng của Bếp Nhà.</p>

        <div className="form-group">
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            placeholder="Nhập email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>

          <input
            id="password"
            type="password"
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={submitting}
        >
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {message && (
          <p className="form-message">{message}</p>
        )}

        <div className="auth-link">
          Chưa có tài khoản?
          <Link to="/dang-ky"> Đăng ký</Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
