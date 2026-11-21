function EmptyState({ onReset }) {
  return (
    <div className="empty-state">

      <div className="empty-icon">🍳</div>

      <h3>Chưa tìm thấy món ăn phù hợp</h3>

      <p>
        Hãy thử tên món khác hoặc thay đổi nguyên liệu tìm kiếm.
      </p>

      <button type="button" onClick={onReset}>
        Xóa bộ lọc
      </button>

    </div>
  );
}

export default EmptyState;