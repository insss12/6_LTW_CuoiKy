import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Bắt buộc đăng nhập: đọc token ở header "Authorization: Bearer <token>"
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Vui lòng đăng nhập để tiếp tục');
  }

  // Token sai hoặc hết hạn sẽ ném lỗi, errorHandler tự đổi thành 401
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Lấy người dùng từ CSDL để luôn dùng role mới nhất
  const user = await User.findById(decoded.id);
  if (!user) {
    throw ApiError.unauthorized('Tài khoản không còn tồn tại');
  }

  req.user = user;
  next();
});

// Giới hạn theo vai trò, dùng SAU protect. Ví dụ: requireRole('admin')
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Vui lòng đăng nhập để tiếp tục'));
  }

  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden());
  }

  return next();
};
