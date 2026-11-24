import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const SALT_ROUNDS = 10;

// Chỉ trả những trường an toàn, không bao giờ trả mật khẩu
const toUserResponse = ({ _id, name, email, role, createdAt }) => ({
  id: _id,
  name,
  email,
  role,
  createdAt,
});

// Kiểm tra dữ liệu đầu vào ở server.
// Phải kiểm tra kiểu string để chặn NoSQL injection (ví dụ email: { "$gt": "" })
const validateAuthInput = ({ name, email, password }, { requireName }) => {
  const errors = [];

  if (requireName && (typeof name !== 'string' || name.trim().length < 2)) {
    errors.push({ field: 'name', message: 'Họ tên phải có ít nhất 2 ký tự' });
  }

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push({ field: 'email', message: 'Email không hợp lệ' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    errors.push({ field: 'password', message: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }

  return errors;
};

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const errors = validateAuthInput(req.body, { requireName: true });
  if (errors.length > 0) {
    throw ApiError.badRequest('Dữ liệu không hợp lệ', errors);
  }

  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw ApiError.conflict('Email này đã được đăng ký');
  }

  // Mã hóa mật khẩu bằng bcrypt; không nhận role từ client: người mới luôn là "member"
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    user: toUserResponse(user),
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const errors = validateAuthInput(req.body, { requireName: false });
  if (errors.length > 0) {
    throw ApiError.badRequest('Dữ liệu không hợp lệ', errors);
  }

  const { email, password } = req.body;

  // password mặc định bị ẩn (select: false) nên phải lấy ra tường minh
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  // Dùng chung một thông báo để không lộ email nào đã tồn tại
  const isMatch = user ? await bcrypt.compare(password, user.password) : false;
  if (!isMatch) {
    throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    user: toUserResponse(user),
  });
});

// GET /api/auth/me  (cần đăng nhập)
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: toUserResponse(req.user) });
});
