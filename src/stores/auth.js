import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const company = ref(null)
  const router = useRouter()

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isCompanyUser = computed(() => user.value?.role === 'user')

  const login = async (email, password) => {
    try {
      // Verificar se é o admin padrão
      if (email === import.meta.env.VITE_ADMIN_EMAIL && password === import.meta.env.VITE_ADMIN_PASSWORD) {
        const adminData = {
          user: {
            id: 1,
            name: 'Administrador',
            email: email,
            role: 'admin'
          },
          company: null,
          token: 'admin-token'
        }

        user.value = adminData.user
        company.value = adminData.company
        token.value = adminData.token

        localStorage.setItem('token', adminData.token)
        localStorage.setItem('user', JSON.stringify(adminData.user))
        return adminData
      }

      // Se não for admin, tenta login normal
      const response = await api.post(webhooks.auth.login, { email, password })

      if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
        throw new Error('Resposta inválida do servidor')
      }

      // Extrair token e dados do usuário do array de resposta
      const tokenData = response.data[0]
      const userData = response.data[1]

      if (!tokenData?.token || !userData?.id) {
        throw new Error('Dados de autenticação inválidos')
      }

      // Atualizar estado
      user.value = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        company_id: userData.company_id,
        status: userData.status
      }
      token.value = tokenData.token

      // Salvar no localStorage
      localStorage.setItem('token', tokenData.token)
      localStorage.setItem('user', JSON.stringify(user.value))

      // Se tiver company_id, buscar dados da empresa
      if (userData.company_id) {
        try {
          const companyResponse = await api.get(webhooks.companies.listone, {
            id: userData.company_id
          })
          if (companyResponse.data) {
            company.value = companyResponse.data
            localStorage.setItem('company', JSON.stringify(companyResponse.data))
          }
        } catch (error) {
          console.error('Erro ao buscar dados da empresa:', error)
        }
      }

      return {
        user: user.value,
        company: company.value,
        token: token.value
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Se for admin, apenas limpa os dados locais
      if (token.value === 'admin-token') {
        clearAuthData()
        return
      }

      // Para usuários normais, tenta fazer logout no servidor
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

      // Limpa os dados de autenticação
      clearAuthData()

      // Redireciona para a página de login
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Mesmo com erro, limpa os dados locais
      clearAuthData()
      router.push('/login')
    }
  }

  const clearAuthData = () => {
    user.value = null
    company.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('company')
  }

  const verify = async () => {
    try {
      if (!token.value) return false

      // Se for admin, retorna true
      if (token.value === 'admin-token') return true

      const response = await api.post(webhooks.auth.verify, {
        token: token.value,
        user_id: user.value?.id
      })
      return response.data?.valid || false
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      return false
    }
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  const initializeFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('user')
      const storedCompany = localStorage.getItem('company')

      if (storedUser) {
        user.value = JSON.parse(storedUser)
      }
      if (storedCompany) {
        company.value = JSON.parse(storedCompany)
      }
    } catch (error) {
      console.error('Erro ao inicializar dados do localStorage:', error)
      // Limpar dados inválidos
      clearAuthData()
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
    verify,
    isAuthenticated
  }
}) 