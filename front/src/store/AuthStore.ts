import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthApi from '@/api/AuthApi.ts'
import { useFetch } from '@/composables/useFetch.ts'
import type { LoginPayload } from '@/common/types/auth/LoginPayload.ts'
import { parseApiError } from '@/composables/parseApiError.ts'
import type {UserProfile} from "@/common/types/auth/UserProfile.ts";

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const isAuthenticated = ref(false)
  const router = useRouter()
  const { isLoading, error, makeRequest } = useFetch()
  const isLoggedIn = computed(() => isAuthenticated.value && !!user.value)

  const $reset = () => {
    user.value = null
    isAuthenticated.value = false
    error.value = ''
  }

  const makeAuthRequest = async <T>(requestFn: () => Promise<T>): Promise<T> => {
    try {
      return await requestFn()
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } }
      if (err.response?.status === 401) {
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          return requestFn()
        } else {
          $reset()
          await router.push('/login')
          throw new Error('Сессия истекла. Пожалуйста, войдите снова.')
        }
      }
      throw e
    }
  }

  const login = async (payload: LoginPayload) => {
    try {
      await makeRequest(() => AuthApi.login(payload))
      isAuthenticated.value = true
      error.value = ''
      await fetchProfile()
      await router.push('/')
    } catch (e: unknown) {
      const message = parseApiError(e)
      error.value = message
      console.warn('Ошибка входа:', message)
    }
  }

  const logout = async () => {
    try {
      await makeRequest(() => AuthApi.logout())
    } catch (e) {
      console.warn('Ошибка выхода', e)
    } finally {
      $reset()
      await router.push('/login')
    }
  }


  const fetchProfile = async () => {
    try {
      const response = await makeRequest(() => AuthApi.getProfile())
      user.value = response.data
      isAuthenticated.value = true
      return true
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } }
      if (err?.response?.status === 401) {
        const refreshed = await refreshAccessToken()

        if (refreshed) {
          try {
            const response = await makeRequest(() => AuthApi.getProfile())
            user.value = response.data
            isAuthenticated.value = true
            return true
          } catch {
            console.warn('Токен недействителен даже после обновления')
          }
        }
      }
      $reset()
      return false
    }
  }

  const refreshAccessToken = async () => {
    try {
      await AuthApi.refreshToken()
      // isAuthenticated.value = true
      return true
    } catch (e: unknown) {
      console.warn('Ошибка обновления токена:', parseApiError(e))
      $reset()
      return false
    }
  }
  const initAuth = async () => {
    const hasRefresh = document.cookie.includes('refresh_token=')
    if (!hasRefresh) {
      console.log('Нет refresh_token — пропускаем проверку профиля')
      return
    }

    const ok = await fetchProfile()
    if (!ok) $reset()
  }


  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    isLoggedIn,
    login,
    logout,
    fetchProfile,
    refreshAccessToken,
    $reset,
    makeAuthRequest,
    initAuth
  }
})
