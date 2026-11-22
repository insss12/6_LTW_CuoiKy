import { Link, NavLink } from "react-router-dom";

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-container">

        <Link to="/" className="brand">
          <span className="brand-icon">✳</span>

          <span className="brand-text">
            <strong>Bếp Nhà</strong>
            <small>SỔ TAY CÔNG THỨC</small>
          </span>
        </Link>

        <nav className="main-nav">

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Trang chủ
          </NavLink>

          <NavLink
            to="/cong-thuc-cua-toi"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Công thức của tôi
          </NavLink>

        </nav>

        <div className="header-actions">

          <Link to="/dang-nhap" className="login-link">
            Đăng nhập
          </Link>

          <Link to="/dang-ky" className="header-button">
            Đăng ký
          </Link>

        </div>

      </div>
    </header>
  );
}

export default SiteHeader;
