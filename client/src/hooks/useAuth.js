import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

// Custom hook: lấy thông tin đăng nhập từ AuthContext
function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }

  return context;
}

export default useAuth;
