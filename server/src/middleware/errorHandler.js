// Chuyển mọi loại lỗi về cùng một dạng JSON
// (4 tham số để Express nhận ra đây là middleware xử lý lỗi)
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi máy chủ';
  let details = err.details;

  // Lỗi validate của Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dữ liệu không hợp lệ';
    details = Object.values(err.errors).map(({ path, message: msg }) => ({
      field: path,
      message: msg,
    }));
  }

  // _id sai định dạng
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Giá trị không hợp lệ cho trường "${err.path}"`;
  }

  // Trùng khóa unique (email, đánh giá lần 2, món yêu thích trùng...)
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyPattern || {});
    message = `Dữ liệu đã tồn tại (${fields.join(', ')})`;
  }

  // Lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token không hợp lệ';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token đã hết hạn, vui lòng đăng nhập lại';
  }

  // JSON gửi lên bị sai cú pháp
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'JSON gửi lên không hợp lệ';
  }

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV !== 'production' && statusCode === 500 && { stack: err.stack }),
  });
};

export default errorHandler;
