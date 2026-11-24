const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Gọi API, trả về JSON. Nếu server báo lỗi thì ném ApiError.
export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new ApiError(
      "Không kết nối được tới server. Hãy kiểm tra server đã chạy chưa.",
      0
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message || "Có lỗi xảy ra, vui lòng thử lại.",
      response.status,
      data.details
    );
  }

  return data;
}

// Lấy thông báo lỗi để hiển thị (gộp lỗi từng trường nếu server trả về)
export function getErrorMessage(error) {
  if (Array.isArray(error.details) && error.details.length > 0) {
    return error.details.map((item) => item.message).join(" ");
  }

  return error.message || "Có lỗi xảy ra, vui lòng thử lại.";
}
