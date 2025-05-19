import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const company = computed(() => authStore.company)
  const token = computed(() => authStore.token)
  const isAdmin = computed(() => authStore.isAdmin)
  const isCompanyUser = computed(() => authStore.isCompanyUser)

  const login = async (email, password) => {
    try {
      return await authStore.login(email, password)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authStore.logout()
    } catch (error) {
      throw error
    }
  }

  const verify = async () => {
    try {
      return await authStore.verify()
    } catch (error) {
      throw error
    }
  }

  const isAuthenticated = () => {
    return authStore.isAuthenticated()
  }

  return {
    user,
    company,
    token,
    isAdmin,
    isCompanyUser,
    login,
    logout,
    verify,
    isAuthenticated
  }
} 