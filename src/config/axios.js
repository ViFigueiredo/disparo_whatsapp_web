import axios from 'axios'
import { useAuthStore } from '../stores/auth'

// Criar instância do axios
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    // Debug logs
    console.group('🌐 Request Debug')
    console.log('📡 URL:', config.url)
    console.log('🔧 Method:', config.method?.toUpperCase())
    console.log('📦 Data:', config.data)
    console.log('🔑 Token:', authStore.token ? 'Present' : 'Missing')
    console.log('📋 Headers:', config.headers)
    console.groupEnd()

    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`

      // Log após adicionar o token
      console.group('🔐 Auth Debug')
      console.log('Token added to headers:', config.headers['Authorization'])
      console.groupEnd()
    }

    return config
  }
)

// // Interceptor para tratar erros de resposta
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       const authStore = useAuthStore()
//       authStore.logout()
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   }
// )

export default api 