const jwt = require('jsonwebtoken');

const generateToken = (userId, userType) => {
  console.log('🔐 Generating JWT token:', {
    userId,
    userType,
    hasSecret: !!process.env.JWT_SECRET,
    secretLength: process.env.JWT_SECRET?.length
  });
  
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  const token = jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  console.log('🔐 Token generated successfully, length:', token.length);
  return token;
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};