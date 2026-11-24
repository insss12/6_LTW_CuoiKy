// Express 4 không tự bắt lỗi của hàm async,
// bọc lại để mọi lỗi được chuyển tới errorHandler.
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export default asyncHandler;
