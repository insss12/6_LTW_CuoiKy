// Tạo tài khoản Admin (không cho đăng ký admin qua API).
// Cách dùng (trong thư mục server):
//   node src/scripts/createAdmin.js admin@bepnha.com MatKhau123 "Quan tri vien"
import 'dotenv/config';

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import connectDB from '../config/db.js';
import User from '../models/User.js';

const run = async () => {
  const [email, password, name = 'Admin'] = process.argv.slice(2);

  if (!email || !password) {
    console.log('Cach dung: node src/scripts/createAdmin.js <email> <mat khau> [ten]');
    process.exit(1);
  }

  if (password.length < 6) {
    console.log('Mat khau phai co it nhat 6 ky tu');
    process.exit(1);
  }

  await connectDB();

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`Da nang ${existing.email} len admin`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'admin',
    });
    console.log(`Da tao admin: ${admin.email}`);
  }

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
