import { defineStore } from 'pinia'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    isLoading: false,
    error: null,
    lastOperation: null
  }),

  getters: {
    formattedUsers: (state) => {
      return state.users.map(user => ({
        ...user,
        role: user.role === 'admin' ? 'Administrador' : 'Usuário',
        status: user.status === 'active' ? 'Ativo' : 'Inativo'
      }))
    }
  },

  actions: {
    async fetchUsers() {
      try {
        this.isLoading = true
        this.error = null
        const response = await api.get(webhooks.users.list)

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        this.users = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
        this.error = error.message || 'Erro ao buscar usuários'
        this.users = []
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createUser(userData) {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'create'

        const response = await api.post(webhooks.users.create, userData)

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        await this.fetchUsers()
        return response.data
      } catch (error) {
        console.error('Erro ao criar usuário:', error)
        this.error = error.message || 'Erro ao criar usuário'
        throw error
      } finally {
        this.isLoading = false
        this.lastOperation = null
      }
    },

    async updateUser(userData) {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'update'

        if (!userData.id) {
          throw new Error('ID do usuário é obrigatório para atualização')
        }

        const response = await api.post(webhooks.users.update, userData)

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        await this.fetchUsers()
        return response.data
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error)
        this.error = error.message || 'Erro ao atualizar usuário'
        throw error
      } finally {
        this.isLoading = false
        this.lastOperation = null
      }
    },

    async deleteUser(userId) {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'delete'

        await api.post(webhooks.users.delete, { id: userId })
        await this.fetchUsers()
        return true
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        this.error = error.message || 'Erro ao excluir usuário'
        throw error
      } finally {
        this.isLoading = false
        this.lastOperation = null
      }
    },

    async resetPassword(userId) {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'resetPassword'

        const response = await api.post(webhooks.users.resetPassword, { id: userId })

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        return response.data
      } catch (error) {
        console.error('Erro ao resetar senha:', error)
        this.error = error.message || 'Erro ao resetar senha'
        throw error
      } finally {
        this.isLoading = false
        this.lastOperation = null
      }
    }
  }
}) 