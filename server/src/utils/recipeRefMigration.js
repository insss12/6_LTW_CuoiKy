// Chuyển dữ liệu cũ (gắn với công thức bằng recipeKey dạng chuỗi) sang tham chiếu
// recipe: ObjectId. Chỉ dùng API của driver MongoDB (db.collection(...)) nên không
// phụ thuộc vào schema Mongoose mới, và có thể kiểm thử bằng CSDL giả.
//
// An toàn dữ liệu:
//  - Chạy thử được (dryRun) mà không ghi gì.
//  - Sao lưu collection cũ sang "<tên>_backup_step4" trước khi sửa (không ghi đè backup có sẵn).
//  - Chạy lại nhiều lần không sao: chỉ xử lý những bản ghi còn recipeKey.

export const BACKUP_SUFFIX = "_backup_step4";

const hasLegacyKey = (index) => Boolean(index.key && "recipeKey" in index.key);

// Index cũ có chứa recipeKey. Collection chưa tồn tại thì driver báo NamespaceNotFound: coi như không có.
const listLegacyIndexes = async (collection) => {
  try {
    return (await collection.indexes()).filter(hasLegacyKey);
  } catch (error) {
    if (error.codeName === "NamespaceNotFound" || error.code === 26) {
      return [];
    }
    throw error;
  }
};

const collectionExists = async (db, name) =>
  (await db.listCollections({ name }, { nameOnly: true }).toArray()).length > 0;

const backup = async (db, collection, log) => {
  const backupName = collection.collectionName + BACKUP_SUFFIX;

  if (await collectionExists(db, backupName)) {
    log(`  ${collection.collectionName}: da co ${backupName}, giu nguyen backup cu`);
    return;
  }

  await collection.aggregate([{ $match: {} }, { $out: backupName }]).toArray();
  log(`  ${collection.collectionName}: da sao luu sang ${backupName}`);
};

// Đổi recipeKey -> recipe cho một collection (reviews, recipeviews, recipemetrics).
// Bản ghi trỏ tới công thức không còn tồn tại trong DB (ví dụ món lưu ở localStorage)
// không thể nối được nên bị xóa khỏi collection chính (vẫn còn trong backup).
//
// Index unique cũ (ví dụ user + recipeKey) phải được bỏ kể cả khi collection không còn
// bản ghi cũ nào: nếu không, các bản ghi mới (không có recipeKey) sẽ đụng nhau trên index đó.
export const convertCollection = async (db, name, keyMap, { dryRun, log }) => {
  const collection = db.collection(name);

  const total = await collection.countDocuments({ recipeKey: { $exists: true } });
  const legacyIndexes = await listLegacyIndexes(collection);

  const result = {
    name,
    total,
    mapped: 0,
    orphaned: 0,
    orphanKeys: [],
    legacyIndexes: legacyIndexes.map((index) => index.name),
    droppedIndexes: []
  };

  if (total === 0 && legacyIndexes.length === 0) {
    return result;
  }

  const plan = [];
  if (total > 0) {
    for (const key of await collection.distinct("recipeKey")) {
      const count = await collection.countDocuments({ recipeKey: key });
      const recipeId = keyMap.get(key);

      plan.push({ key, count, recipeId });

      if (recipeId) {
        result.mapped += count;
      } else {
        result.orphaned += count;
        result.orphanKeys.push(key);
      }
    }
  }

  if (dryRun) {
    return result;
  }

  if (total > 0) {
    await backup(db, collection, log);
  }

  // Bỏ index cũ TRƯỚC khi sửa dữ liệu, nếu không các bản ghi không còn recipeKey
  // sẽ đụng nhau trên index unique cũ.
  for (const index of legacyIndexes) {
    await collection.dropIndex(index.name);
    result.droppedIndexes.push(index.name);
  }

  for (const { key, recipeId } of plan) {
    if (recipeId) {
      await collection.updateMany(
        { recipeKey: key },
        { $set: { recipe: recipeId }, $unset: { recipeKey: "" } }
      );
    } else {
      await collection.deleteMany({ recipeKey: key });
    }
  }

  return result;
};

// Chép lượt thích cũ (recipelikes) sang favorites, rồi đổi tên collection cũ thành backup.
export const convertLikes = async (db, names, keyMap, { dryRun, log }) => {
  const likes = db.collection(names.likes);
  const favorites = db.collection(names.favorites);

  const total = await likes.countDocuments({});
  const result = { name: names.likes, total, copied: 0, alreadyThere: 0, orphaned: 0 };

  if (total === 0) {
    return result;
  }

  const now = new Date();

  for (const like of await likes.find({}).toArray()) {
    const recipeId = keyMap.get(like.recipeKey);

    if (!recipeId) {
      result.orphaned += 1;
      continue;
    }

    const filter = { user: like.user, recipe: recipeId };

    if (dryRun) {
      const exists = await favorites.countDocuments(filter);
      result[exists ? "alreadyThere" : "copied"] += 1;
      continue;
    }

    const written = await favorites.updateOne(
      filter,
      { $setOnInsert: { createdAt: like.createdAt || now, updatedAt: like.updatedAt || now } },
      { upsert: true }
    );

    result[written.upsertedCount > 0 ? "copied" : "alreadyThere"] += 1;
  }

  if (!dryRun) {
    const backupName = names.likes + BACKUP_SUFFIX;

    if (await collectionExists(db, backupName)) {
      log(`  ${names.likes}: da co ${backupName}, giu nguyen ca hai`);
    } else {
      await likes.rename(backupName);
      log(`  ${names.likes}: da doi ten thanh ${backupName} (backup)`);
    }
  }

  return result;
};

export const migrateRecipeRefs = async ({ db, keyMap, names, dryRun = false, log = () => {} }) => {
  const options = { dryRun, log };

  return {
    reviews: await convertCollection(db, names.reviews, keyMap, options),
    views: await convertCollection(db, names.views, keyMap, options),
    metrics: await convertCollection(db, names.metrics, keyMap, options),
    likes: await convertLikes(db, names, keyMap, options)
  };
};
