import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";

function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Đã đăng nhập rồi thì không cần ở trang này
  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      // Đăng ký thành công thì server trả token, người dùng được đăng nhập luôn
      await register(name.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Đăng ký</h1>

        <p>Tạo tài khoản để chia sẻ công thức nấu ăn.</p>

        <div className="form-group">
          <label htmlFor="name">Họ và tên</label>

          <input
            id="name"
            type="text"
            placeholder="Nhập họ tên"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

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
            placeholder="Ít nhất 6 ký tự"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">
            Xác nhận mật khẩu
          </label>

          <input
            id="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
          />
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={submitting}
        >
          {submitting ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        {message && (
          <p className="form-message">{message}</p>
        )}

        <div className="auth-link">
          Đã có tài khoản?
          <Link to="/dang-nhap"> Đăng nhập</Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;
