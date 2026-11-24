import ApiError from '../utils/ApiError.js';

// Route không tồn tại -> chuyển thành lỗi 404
const notFound = (req, res, next) => {
  next(ApiError.notFound(`Khong tim thay duong dan ${req.method} ${req.originalUrl}`));
};

export default notFound;
