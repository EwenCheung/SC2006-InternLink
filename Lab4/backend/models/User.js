// This file now just exports common methods for use in both user types
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Shared methods for both user types
export const comparePassword = async function(candidatePassword, hashedPassword) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

export const createJWT = function(userId, email, role) {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

export const hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
