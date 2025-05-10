import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const login = async (credentials) => {
    // Simular autenticação
    user.value = {
      id: 1,
      email: credentials.email,
      name: 'Administrador'
    }
    token.value = 'fake-jwt-token'
    localStorage.setItem('token', token.value)
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated
  }
}) 