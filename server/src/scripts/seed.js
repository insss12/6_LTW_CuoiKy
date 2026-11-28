// Tạo dữ liệu ban đầu: loại món, 2 tài khoản demo và các công thức mẫu.
// Chạy trong thư mục server:
//   npm run seed              thêm những gì còn thiếu (chạy nhiều lần vẫn an toàn)
//   npm run seed -- --reset   xóa rồi nạp lại các công thức mẫu (mau-1...mau-8)
import 'dotenv/config';

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import connectDB from '../config/db.js';
import Category from '../models/Category.js';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import sampleRecipes from '../data/sampleRecipes.js';
import { validateRecipeInput } from '../utils/recipeValidation.js';
import { slugify } from '../utils/text.js';

const CATEGORY_NAMES = [
  'Món chính',
  'Món nước',
  'Món chay',
  'Ăn sáng',
  'Món khai vị',
  'Tráng miệng',
];

// Tài khoản demo (ghi trong README để giảng viên đăng nhập thử)
const DEMO_USERS = [
  { name: 'Quản trị viên', email: 'admin@bepnha.com', password: 'Admin@123', role: 'admin' },
  { name: 'Thành viên Demo', email: 'member@bepnha.com', password: 'Member@123', role: 'member' },
];

const run = async () => {
  const reset = process.argv.includes('--reset');

  await connectDB();

  // 1) Loại món
  const categoryIds = new Map();
  for (const name of CATEGORY_NAMES) {
    const category = await Category.findOneAndUpdate(
      { name },
      // $set slug để cả loại món đã tồn tại từ trước (chưa có slug) cũng được điền
      { $set: { slug: slugify(name) }, $setOnInsert: { isActive: true } },
      { upsert: true, returnDocument: 'after' }
    );
    categoryIds.set(name, String(category._id));
  }
  console.log(`Loai mon: ${categoryIds.size}`);

  // 2) Tài khoản demo (không ghi đè nếu email đã tồn tại)
  const users = new Map();
  for (const demo of DEMO_USERS) {
    let user = await User.findOne({ email: demo.email });

    if (user) {
      console.log(`Tai khoan da co: ${demo.email} (giu nguyen)`);
    } else {
      user = await User.create({
        name: demo.name,
        email: demo.email,
        password: await bcrypt.hash(demo.password, 10),
        role: demo.role,
      });
      console.log(`Da tao tai khoan: ${demo.email} / ${demo.password} (${demo.role})`);
    }

    users.set(demo.role, user);
  }

  const admin = users.get('admin');

  // 3) Công thức mẫu, gắn cho tài khoản admin và duyệt sẵn
  const legacyKeys = sampleRecipes.map((sample) => sample.id);

  if (reset) {
    const { deletedCount } = await Recipe.deleteMany({ legacyKey: { $in: legacyKeys } });
    console.log(`Da xoa ${deletedCount} cong thuc mau cu`);
  }

  let inserted = 0;
  let skipped = 0;

  // Nạp từ món cuối về món đầu để mau-1 có createdAt mới nhất (hiện đầu danh sách)
  for (const sample of [...sampleRecipes].reverse()) {
    const categoryId = categoryIds.get(sample.category);

    if (!categoryId) {
      throw new Error(`${sample.id}: loai mon "${sample.category}" chua co trong CATEGORY_NAMES`);
    }

    const { errors, value } = validateRecipeInput({ ...sample, category: categoryId });

    if (errors.length > 0) {
      const detail = errors.map((item) => `${item.field}: ${item.message}`).join('; ');
      throw new Error(`${sample.id} khong hop le: ${detail}`);
    }

    // $setOnInsert: chỉ chèn khi chưa có, không ghi đè bản Admin đã chỉnh sửa
    const result = await Recipe.updateOne(
      { legacyKey: sample.id },
      {
        $setOnInsert: {
          ...value,
          legacyKey: sample.id,
          author: admin._id,
          status: 'approved',
          moderatedBy: admin._id,
          moderatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      inserted += 1;
    } else {
      skipped += 1;
    }
  }

  console.log(`Cong thuc mau: them ${inserted}, bo qua ${skipped} (da co)`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Seed that bai:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
