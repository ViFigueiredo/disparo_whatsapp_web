import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'

export function useAuth() {
  const authStore = useAuthStore()
  const toast = useToast()

  const user = computed(() => authStore.user)
  const company = computed(() => authStore.company)
  const token = computed(() => authStore.token)
  const isAdmin = computed(() => authStore.isAdmin)
  const isCompanyUser = computed(() => authStore.isCompanyUser)
  const isAuthenticated = computed(() => authStore.isAuthenticated)

  const handleError = (error, message) => {
    console.error(message, error)
    toast.error(message)
    throw error
  }

  const login = async (email, password) => {
    try {
      const result = await authStore.login(email, password)
      toast.success('Login realizado com sucesso!')
      return result
    } catch (error) {
      return handleError(error, 'Erro ao realizar login')
    }
  }

  const logout = async () => {
    try {
      await authStore.logout()
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      return handleError(error, 'Erro ao realizar logout')
    }
  }

  const verify = async () => {
    try {
      const isValid = await authStore.verify()
      if (!isValid) {
        toast.error('Sessão expirada. Por favor, faça login novamente.')
      }
      return isValid
    } catch (error) {
      return handleError(error, 'Erro ao verificar autenticação')
    }
  }

  return {
    user,
    company,
    token,
    isAdmin,
    isCompanyUser,
    isAuthenticated,
    login,
    logout,
    verify
  }
} 