import { useEffect, useState } from "react";

// Trả về giá trị sau khi người dùng ngừng thay đổi trong `delay` ms,
// tránh gọi API sau mỗi phím gõ.
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    // Dọn timer khi giá trị đổi tiếp hoặc component bị gỡ
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
