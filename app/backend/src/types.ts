import { z } from 'zod';

// Esquema para registro
export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  dailyCalorieGoal: z.number().int().positive().optional().default(2000),
});

// Esquema para login
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Esquema para actualizar perfil
export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  dailyCalorieGoal: z.number().int().positive().optional(),
});

// Esquema para cambiar contraseña
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

// Tipos derivados de los esquemas
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;

// Tipo de usuario en la BD
export interface User {
  id: string;
  email: string;
  name: string;
  dailyCalorieGoal: number;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tipo de respuesta de auth
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Tipo de error API
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
