import { Link } from "react-router-dom";

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-container">

        <Link to="/" className="footer-brand">
          <span className="brand-icon">✳</span>
          <strong>Bếp Nhà</strong>
        </Link>

        <p>
          Lưu giữ công thức, chia sẻ niềm vui nấu nướng.
        </p>

        <span className="copyright">
          © 2026 Bếp Nhà. Sổ tay công thức nấu ăn.
        </span>

      </div>
    </footer>
  );
}

export default SiteFooter;