import api from './base.ts'
import type { LoginPayload } from '@/common/types/auth/LoginPayload.ts'
import type { LoginResponse } from '@/common/types/auth/LoginResponse.ts'

export default class AuthApi {
  static async login(payload: LoginPayload) {
    const formData = new URLSearchParams()
    formData.append('username', payload.email)
    formData.append('password', payload.password)

    return api.post<LoginResponse>('auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  }

  static async logout(token: string) {
    return api.post('auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  static async getProfile(token: string) {
    return api.get('auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  static async refreshToken(token: string) {
    return api.post('auth/refresh', {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
  }
}
