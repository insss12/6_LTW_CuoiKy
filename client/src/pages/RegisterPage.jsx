
import { useState } from "react";
import { Link } from "react-router-dom";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
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

    setMessage(
      "Thông tin hợp lệ. Chức năng đăng ký sẽ được kết nối với Server sau."
    );
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
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(event.target.value)
            }
          />
        </div>

        <button type="submit" className="auth-button">
          Đăng ký
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
