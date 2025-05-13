import { ref, computed } from 'vue'

const user = ref(null)

export function useAuth() {
  // Função para carregar os dados do usuário do localStorage
  const loadUser = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  // Carregar usuário ao inicializar
  loadUser()

  // Computed para verificar se é admin
  const isAdmin = computed(() => {
    return user.value?.role === 'admin'
  })

  // Função para atualizar o usuário
  const setUser = (userData) => {
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  // Função para logout
  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  return {
    user,
    isAdmin,
    setUser,
    logout,
    loadUser
  }
} 