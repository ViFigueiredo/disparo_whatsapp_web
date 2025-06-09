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

  const login = async (email, password) => {
    try {
      // Tenta login normal pela API
      const response = await api.post(webhooks.auth.login, { email, password })

      if (!response.data || !Array.isArray(response.data) || response.data.length < 2) {
        throw new Error('Resposta inválida do servidor')
      }

      // Extrair token e dados do usuário do array de resposta
      const tokenData = response.data[0]
      const userData = response.data[1]

      // Verificar se os dados essenciais estão presentes (id pode ser 0, que é truthy aqui)
      if (!tokenData?.token || userData?.id === undefined || userData?.id === null) {
        throw new Error('Dados de autenticação inválidos')
      }

      // Armazenar dados no estado e no localStorage
      user.value = userData
      company.value = userData.company // Supondo que a empresa venha junto nos dados do usuário
      token.value = tokenData.token

      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('company', JSON.stringify(company.value))

      return { user: user.value, company: company.value, token: token.value }

    } catch (error) {
      console.error('Erro no login:', error)
      clearAuthData() // Limpa dados em caso de erro no login
      throw error
    }
  }

  const logout = async () => {
    try {
      // Para usuários normais, tenta fazer logout no servidor
      if (token.value) {
        try {
          // Incluir user_id e token no body conforme endpoint de logout
          await api.post(webhooks.auth.logout, {
            user_id: user.value?.id,
            token: token.value
          })
        } catch (error) {
          console.error('Erro ao fazer logout no servidor:', error)
          // Continuar mesmo com erro no servidor para limpar o estado local
        }
      }

      // Limpa os dados de autenticação locais
      clearAuthData()

      // Redireciona para a página de login
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      // Mesmo com erro, limpa os dados locais e redireciona
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
      // Verifica se token e user.id existem (considerando 0 como válido)
      if (!token.value || user.value?.id === undefined || user.value?.id === null) {
        clearAuthData() // Limpa se não tiver token ou user id
        return false
      }

      // Verifica a autenticação no servidor
      const response = await api.post(webhooks.auth.verify, {
        token: token.value,
        user_id: user.value?.id
      })

      // Se a verificação falhar no servidor
      if (!response.data?.valid) {
        clearAuthData() // Limpa dados se inválido
        return false
      }

      return true // Autenticado e válido

    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      clearAuthData() // Limpa dados em caso de erro na verificação
      return false
    }
  }

  // Corrigido: verifica se token existe E user.id não é null/undefined
  const isAuthenticated = computed(() => !!token.value && (user.value?.id !== undefined && user.value?.id !== null))

  return {
    user,
    token,
    company,
    isAdmin,
    isCompanyUser,
    login,
    logout,
    verify,
    isAuthenticated
  }
}) 