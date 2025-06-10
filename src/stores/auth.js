import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'
import { useRouter } from 'vue-router'

function safeParse(item) {
  try {
    if (!item || item === 'undefined') return null
    return JSON.parse(item)
  } catch (e) {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(safeParse(localStorage.getItem('user')))
  const token = ref(localStorage.getItem('token') || null)
  const company = ref(safeParse(localStorage.getItem('company')))
  const router = useRouter()

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isCompanyUser = computed(() => user.value?.role === 'user')
  const isAuthenticated = computed(() => !!token.value && (user.value?.id !== undefined && user.value?.id !== null))

  const setAuthData = (userData, tokenData) => {
    user.value = userData
    company.value = userData.company
    token.value = tokenData.token

    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    localStorage.setItem('company', JSON.stringify(company.value))
  }

  const clearAuthData = () => {
    user.value = null
    company.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('company')
  }

  const validateAuthResponse = (response) => {
    if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
      throw new Error('Resposta inválida do servidor')
    }

    const tokenData = response.data[0]
    const userData = response.data[1]

    if (!tokenData?.token || userData?.id === undefined || userData?.id === null) {
      throw new Error('Dados de autenticação inválidos')
    }

    return { tokenData, userData }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post(webhooks.auth.login, { email, password })
      const { tokenData, userData } = validateAuthResponse(response)
      setAuthData(userData, tokenData)
      return { user: user.value, company: company.value, token: token.value }
    } catch (error) {
      console.error('Erro no login:', error)
      clearAuthData()
      throw error
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        try {
          await api.post(webhooks.auth.logout, {
            user_id: user.value?.id,
            token: token.value
          })
        } catch (error) {
          console.error('Erro ao fazer logout no servidor:', error)
        }
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      clearAuthData()
      router.push('/login')
    }
  }

  const verify = async () => {
    try {
      if (!token.value || user.value?.id === undefined || user.value?.id === null) {
        clearAuthData()
        return false
      }

      const response = await api.post(webhooks.auth.verify, {
        token: token.value,
        user_id: user.value?.id
      })

      if (!response.data?.valid) {
        clearAuthData()
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      clearAuthData()
      return false
    }
  }

  return {
    user,
    token,
    company,
    isAdmin,
    isCompanyUser,
    isAuthenticated,
    login,
    logout,
    verify
  }
}) 