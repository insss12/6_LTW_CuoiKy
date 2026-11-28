// Chuyển dữ liệu review / lượt xem / lượt thích cũ (gắn công thức bằng recipeKey)
// sang tham chiếu tới công thức thật (recipe: _id).
//
// Chạy trong thư mục server, THEO THỨ TỰ:
//   npm run seed                              (cần có công thức mẫu trong DB)
//   npm run migrate:refs -- --dry-run         (chạy thử: chỉ báo cáo, không ghi gì)
//   npm run migrate:refs                      (chạy thật, có sao lưu)
import 'dotenv/config';

import mongoose from 'mongoose';

import connectDB from '../config/db.js';
import Favorite from '../models/Favorite.js';
import Recipe from '../models/Recipe.js';
import RecipeMetric from '../models/RecipeMetric.js';
import RecipeView from '../models/RecipeView.js';
import Review from '../models/Review.js';
import { migrateRecipeRefs } from '../utils/recipeRefMigration.js';

const showOrphans = (label, keys) => {
  if (keys.length > 0) {
    const shown = keys.slice(0, 10).join(', ');
    console.log(`    ${label}: khong noi duoc ${keys.length} ma cong thuc (${shown}${keys.length > 10 ? ', ...' : ''})`);
  }
};

const run = async () => {
  const dryRun = process.argv.includes('--dry-run');

  await connectDB();

  const recipes = await Recipe.find({}).select('legacyKey').lean();

  if (!recipes.some((recipe) => recipe.legacyKey)) {
    throw new Error('Chua co cong thuc mau trong database. Hay chay `npm run seed` truoc.');
  }

  // Mã cũ ("mau-1") và _id dạng chuỗi đều trỏ về _id của công thức
  const keyMap = new Map();
  for (const recipe of recipes) {
    if (recipe.legacyKey) {
      keyMap.set(recipe.legacyKey, recipe._id);
    }
    keyMap.set(String(recipe._id), recipe._id);
  }

  const names = {
    reviews: Review.collection.name,
    views: RecipeView.collection.name,
    metrics: RecipeMetric.collection.name,
    likes: 'recipelikes',
    favorites: Favorite.collection.name,
  };

  console.log(dryRun
    ? '=== CHAY THU (khong ghi gi vao database) ==='
    : '=== CHAY THAT (co sao luu truoc khi sua) ===');

  const summary = await migrateRecipeRefs({
    db: mongoose.connection.db,
    keyMap,
    names,
    dryRun,
    log: console.log,
  });

  console.log('\nKet qua:');
  for (const key of ['reviews', 'views', 'metrics']) {
    const item = summary[key];
    console.log(`  ${item.name}: ${item.total} ban ghi cu -> noi duoc ${item.mapped}, bo (mon khong co trong DB) ${item.orphaned}`);
    showOrphans(item.name, item.orphanKeys);
    if (dryRun && item.legacyIndexes.length > 0) {
      console.log(`    se bo index cu: ${item.legacyIndexes.join(', ')}`);
    }
    if (item.droppedIndexes.length > 0) {
      console.log(`    da bo index cu: ${item.droppedIndexes.join(', ')}`);
    }
  }

  const likes = summary.likes;
  console.log(`  ${likes.name}: ${likes.total} luot thich cu -> chep sang favorites ${likes.copied}, da co san ${likes.alreadyThere}, bo ${likes.orphaned}`);

  if (!dryRun) {
    console.log('\nTao index moi:');
    for (const Model of [Review, Favorite, RecipeView, RecipeMetric]) {
      try {
        await Model.createIndexes();
        console.log(`  ${Model.collection.name}: ok`);
      } catch (error) {
        console.log(`  ${Model.collection.name}: LOI ${error.message}`);
      }
    }
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Chuyen du lieu that bai:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
