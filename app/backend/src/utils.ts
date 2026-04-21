import jwt from 'jsonwebtoken';
// @ts-ignore
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { User } from './types.js';

// Validar email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generar tokens JWT
export const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { 
      sub: user.id,
      email: user.email,
      type: 'access'
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiration } as any
  );

  const refreshToken = jwt.sign(
    { 
      sub: user.id,
      type: 'refresh'
    },
    config.jwtSecret,
    { expiresIn: config.jwtRefreshExpiration } as any
  );

  return { accessToken, refreshToken };
};

// Verificar token JWT
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
};

// Hash de contraseña
export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

// Comparar contraseñas
export const comparePasswords = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};
