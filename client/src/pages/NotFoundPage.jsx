import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="not-found">

      <span>404</span>

      <h1>Trang này chưa có trong sổ tay</h1>

      <p>
        Có vẻ bạn đã đi lạc khỏi căn bếp rồi.
      </p>

      <Link to="/" className="header-button">
        Quay về trang chủ
      </Link>

    </div>
  );
}

export default NotFoundPage;