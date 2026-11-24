import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";

// Route bảo vệ: chưa đăng nhập thì chuyển sang trang đăng nhập.
// Có thể giới hạn vai trò, ví dụ <ProtectedRoute roles={["admin"]} />
function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="form-message">Đang kiểm tra đăng nhập...</p>;
  }

  if (!user) {
    return (
      <Navigate to="/dang-nhap" replace state={{ from: location }} />
    );
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
