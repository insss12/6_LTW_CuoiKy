
class LocalJsonStore {
  constructor(key, storageName = "localStorage") {
    this.key = key;
    this.storageName = storageName;
  }

  read() {
    try {
      const data = window[this.storageName].getItem(this.key);
      const parsed = data ? JSON.parse(data) : {};

      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  write(value) {
    try {
      window[this.storageName].setItem(this.key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
}

class FavoriteRepository {
  constructor(store) {
    this.store = store;
  }

  listIds(userId) {
    const data = this.store.read();

    return Array.isArray(data[userId]) ? data[userId] : [];
  }

  has(userId, recipeId) {
    return this.listIds(userId).includes(recipeId);
  }

  toggle(userId, recipeId) {
    const data = this.store.read();
    const current = this.listIds(userId);
    const exists = current.includes(recipeId);

    data[userId] = exists
      ? current.filter((id) => id !== recipeId)
      : [recipeId, ...current];

    this.store.write(data);

    return !exists;
  }
}

class ReviewRepository {
  constructor(store) {
    this.store = store;
  }

  list(recipeId) {
    const data = this.store.read();
    const reviews = Array.isArray(data[recipeId]) ? data[recipeId] : [];

    return [...reviews].sort((a, b) =>
      String(b.updatedAt).localeCompare(String(a.updatedAt))
    );
  }

  findByUser(recipeId, userId) {
    return (
      this.list(recipeId).find((review) => review.userId === userId) || null
    );
  }

  save(recipeId, user, { rating, comment }) {
    const data = this.store.read();
    const current = Array.isArray(data[recipeId]) ? data[recipeId] : [];
    const old = current.find((review) => review.userId === user.id);
    const now = new Date().toISOString();

    const review = {
      id: `${recipeId}-${user.id}`,
      userId: user.id,
      userName: user.name,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: old?.createdAt || now,
      updatedAt: now
    };

    data[recipeId] = [
      review,
      ...current.filter((item) => item.userId !== user.id)
    ];

    return this.store.write(data);
  }

  remove(recipeId, userId) {
    const data = this.store.read();
    const current = Array.isArray(data[recipeId]) ? data[recipeId] : [];

    data[recipeId] = current.filter((review) => review.userId !== userId);

    return this.store.write(data);
  }

  summary(recipe) {
    // Chỉ tính đánh giá thật do người dùng gửi.
    // Không cộng rating/reviewCount mẫu trong recipes.js.
    const reviews = this.list(recipe.id);

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    const count = reviews.length;

    return {
      average: count === 0
        ? 0
        : Math.round((total / count) * 10) / 10,
      count
    };
  }
}

class ViewRepository {
  constructor(store, sessionStore) {
    this.store = store;
    this.sessionStore = sessionStore;
  }

  count(recipe) {
    const data = this.store.read();

    // Không cộng lượt xem được khai báo sẵn trong dữ liệu mẫu.
    return Number(data[recipe.id]) || 0;
  }

  record(recipeId) {
    const seen = this.sessionStore.read();

    if (seen[recipeId]) {
      return false;
    }

    seen[recipeId] = true;
    this.sessionStore.write(seen);

    const data = this.store.read();
    data[recipeId] = (Number(data[recipeId]) || 0) + 1;

    return this.store.write(data);
  }
}

export const favoriteRepository = new FavoriteRepository(
  new LocalJsonStore("bepnha_favorites")
);

export const reviewRepository = new ReviewRepository(
  new LocalJsonStore("bepnha_reviews")
);

export const viewRepository = new ViewRepository(
  new LocalJsonStore("bepnha_views"),
  new LocalJsonStore("bepnha_viewed", "sessionStorage")
);
