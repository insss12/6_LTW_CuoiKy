function SearchBox({
  keyword,
  onKeywordChange,
  ingredients,
  onIngredientsChange,
  onSearch
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>

      <div className="search-main">

        <span className="search-icon">⌕</span>

        <input
          type="search"
          value={keyword}
          onChange={(event) =>
            onKeywordChange(event.target.value)
          }
          placeholder="Bạn muốn nấu món gì hôm nay?"
          aria-label="Tìm theo tên món ăn"
        />

        <button type="submit">
          Tìm kiếm
        </button>

      </div>

      <div className="ingredient-search">

        <label htmlFor="ingredient-input">
          <span>✦</span>
          Nguyên liệu bạn đang có
        </label>

        <input
          id="ingredient-input"
          type="text"
          value={ingredients}
          onChange={(event) =>
            onIngredientsChange(event.target.value)
          }
          placeholder="Ví dụ: thịt gà, trứng, cà chua..."
        />

      </div>

      <p className="search-hint">
        Mẹo: Nhập nhiều nguyên liệu, ngăn cách bằng dấu phẩy.
      </p>

    </form>
  );
}

export default SearchBox;