import jwt from 'jsonwebtoken';

// Payload chỉ chứa id người dùng (không đưa email, mật khẩu, role... vào token)
const generateToken = (userId) => {
  const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

  if (!JWT_SECRET) {
    throw new Error('Thieu JWT_SECRET trong file .env');
  }

  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN || '7d',
  });
};

export default generateToken;
