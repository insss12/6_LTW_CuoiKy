 
import { useState } from "react";
import { Link } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    setMessage(
      "Giao diện đã hoàn thành. Chức năng đăng nhập sẽ được kết nối với Server sau."
    );
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" className="auth-button">
          Đăng nhập
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
