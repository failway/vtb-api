import api from './base.ts'
import type { ProfileData } from '@/entities/profile/types'

export default class ProfileApi {
  static async getProfileData(): Promise<ProfileData> {
    const response = await api.get('/auth/me')
    return response.data
  }

  static async getFullProfileData(): Promise<ProfileData> {
    // Здесь будет логика получения всех данных профиля
    // включая счета и транзакции
    const response = await api.get('/profile/full')
    return response.data
  }
}
