

// Render Star Ratings: ⭐⭐⭐⭐⭐ 4.5 (43276 reviews)
export const renderStars = (rating: number | null, reviewCount: number | null) => {
  const stars = [];
  const finalRating = rating !== null && rating !== undefined ? rating : 0.0;
  const fullStars = Math.floor(finalRating);
  const hasHalfStar = finalRating % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<span key={i} className="star full">★</span>);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<span key={i} className="star half">⯪</span>);
    } else {
      stars.push(<span key={i} className="star empty">☆</span>);
    }
  }

  return (
    <div className="poi-rating-row">
      <span className="poi-stars">{stars}</span>
      <span className="poi-rating-value text-sm font-semibold">{finalRating.toFixed(1)}</span>
      <span className="poi-reviews-count text-xs text-muted-foreground">
        {reviewCount !== null && reviewCount !== undefined 
          ? `(${reviewCount} đánh giá)` 
          : '(Chưa có đánh giá)'}
      </span>
    </div>
  );
};
