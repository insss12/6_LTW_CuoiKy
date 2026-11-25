const STARS = [1, 2, 3, 4, 5];

function StarRating({ value = 0, onChange }) {
  if (!onChange) {
    return (
      <span
        className="star-rating"
        role="img"
        aria-label={`${value} trên 5 sao`}
      >
        {STARS.map((star) => (
          <span
            key={star}
            className={star <= Math.round(value) ? "star on" : "star"}
          >
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className="star-rating input" role="radiogroup">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} sao`}
          className={star <= value ? "star on" : "star"}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export default StarRating;