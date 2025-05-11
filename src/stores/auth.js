import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const company = ref(null)

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isCompanyUser = computed(() => user.value?.role === 'user')

  const login = async (credentials) => {
    try {
      // Aqui você fará a chamada para sua API
      // Por enquanto, vamos simular a resposta
      const response = {
        user: {
          id: 1,
          name: credentials.email === 'admin@admin.com' ? 'Administrador' : 'Usuário Empresa',
          email: credentials.email,
          role: credentials.email === 'admin@admin.com' ? 'admin' : 'user',
          company_id: credentials.email === 'admin@admin.com' ? null : 1
        },
        company: credentials.email === 'admin@admin.com' ? null : {
          id: 1,
          name: 'Empresa Exemplo',
          cnpj: '12345678901234',
          email: 'empresa@exemplo.com'
        },
        token: 'fake-jwt-token'
      }

      user.value = response.user
      company.value = response.company
      token.value = response.token
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(response.user))
      if (response.company) {
        localStorage.setItem('company', JSON.stringify(response.company))
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  }

  const logout = () => {
    user.value = null
    company.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('company')
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  const initializeFromStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedCompany = localStorage.getItem('company')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
    if (storedCompany) {
      company.value = JSON.parse(storedCompany)
    }
  }

  // Inicializar o estado do localStorage ao carregar a store
  initializeFromStorage()

  return {
    user,
    company,
    token,
    isAdmin,
    isCompanyUser,
    login,
    logout,
    isAuthenticated
  }
}) 