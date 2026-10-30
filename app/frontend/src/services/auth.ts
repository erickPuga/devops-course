import api from './api'
import type {
  AuthResponse,
  LoginForm,
  RegisterForm,
  User,
  UpdateProfileForm,
  ChangePasswordForm,
} from '../types'

export const authService = {
  async register(data: RegisterForm): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data)
    return res.data
  },

  async login(data: LoginForm): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data)
    return res.data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  },
}

export const userService = {
  async getProfile(): Promise<User> {
    const res = await api.get<User>('/users/profile')
    return res.data
  },

  async updateProfile(data: UpdateProfileForm): Promise<User> {
    const res = await api.put<User>('/users/profile', data)
    return res.data
  },

  async changePassword(data: ChangePasswordForm): Promise<void> {
    await api.post('/users/change-password', data)
  },
}

