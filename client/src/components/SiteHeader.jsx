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
            Khám phá
          </NavLink>

          <Link to="/#cong-thuc" className="nav-link">
            Công thức
          </Link>

          <Link to="/#nguyen-lieu" className="nav-link">
            Nguyên liệu
          </Link>
        </nav>

        <Link to="/#cong-thuc" className="header-button">
          Khám phá món ăn
          <span>↗</span>
        </Link>

      </div>
    </header>
  );
}

export default SiteHeader;