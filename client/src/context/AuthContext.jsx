import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { apiRequest } from "../services/api";

export const AuthContext = createContext(null);

const TOKEN_KEY = "bepnha_token";

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Trình duyệt chặn localStorage: bỏ qua, chỉ mất đăng nhập khi tải lại trang
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  // Nếu đã có token lưu sẵn thì phải hỏi server xem token còn dùng được không
  const [loading, setLoading] = useState(Boolean(readToken()));

  // Khi mở lại trang: dùng token đã lưu để lấy thông tin người dùng
  useEffect(() => {
    const savedToken = readToken();

    if (!savedToken) {
      return undefined;
    }

    let cancelled = false;

    async function loadUser() {
      try {
        const data = await apiRequest("/auth/me", { token: savedToken });

        if (!cancelled) {
          setUser(data.user);
        }
      } catch (error) {
        // Token hết hạn hoặc không hợp lệ thì xóa đi
        if (!cancelled && error.status === 401) {
          writeToken(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    // Cleanup: tránh cập nhật state khi component đã bị hủy
    return () => {
      cancelled = true;
    };
  }, []);

  const saveSession = useCallback((data) => {
    writeToken(data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password }
      });

      saveSession(data);
      return data.user;
    },
    [saveSession]
  );

  const register = useCallback(
    async (name, email, password) => {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: { name, email, password }
      });

      saveSession(data);
      return data.user;
    },
    [saveSession]
  );

  const logout = useCallback(() => {
    writeToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
