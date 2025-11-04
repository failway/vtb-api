import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthApi from '@/api/AuthApi.ts'
import { useFetch } from '@/composables/useFetch.ts'
import type { LoginPayload } from '@/common/types/auth/LoginPayload.ts'
import { parseApiError } from '@/composables/parseApiError.ts'
import type {UserProfile} from "@/common/types/auth/UserProfile.ts";

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const user = ref<UserProfile | null>(null)
  const isAuthenticated = ref(false)
  const router = useRouter()
  const { isLoading, error, makeRequest } = useFetch()
  const isLoggedIn = computed(() => isAuthenticated.value && !!user.value)

  const $reset = () => {
    accessToken.value = null
    user.value = null
    isAuthenticated.value = false
    error.value = ''
    localStorage.removeItem('accessToken')
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
      const response = await makeRequest(() => AuthApi.login(payload))
      if (response.data.access_token) {
        accessToken.value = response.data.access_token
        localStorage.setItem('accessToken', accessToken.value)
      }
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
      if (accessToken.value) {
        const token = accessToken.value
        await makeRequest(() => AuthApi.logout(token))
      }
    } catch (e) {
      console.warn('Ошибка выхода', e)
    } finally {
      $reset()
      await router.push('/login')
    }
  }


  const fetchProfile = async () => {
    if (!accessToken.value) return false
    try {
      const response = await makeRequest(() => AuthApi.getProfile(accessToken.value!))
      user.value = response.data
      isAuthenticated.value = true
      return true
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } }
      if (err?.response?.status === 401) {
        const refreshed = await refreshAccessToken()
        if (refreshed) return fetchProfile()
      }
      $reset()
      return false
    }
  }

  const refreshAccessToken = async () => {
    if (!accessToken.value) return false
    try {
      const response = await AuthApi.refreshToken(accessToken.value)
      const token = response.data.access_token
      if (token) {
        accessToken.value = token
        localStorage.setItem('accessToken', token)
        isAuthenticated.value = true
        return true
      }
      return false
    } catch (e: unknown) {
      console.warn('Ошибка обновления токена:', parseApiError(e))
      $reset()
      return false
    }
  }
  const initAuth = async () => {
    if (accessToken.value) {
      const ok = await fetchProfile()
      if (!ok) $reset()
    }
  }


  return {
    accessToken,
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
