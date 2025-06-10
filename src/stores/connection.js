import { defineStore } from 'pinia'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'

export const useConnectionStore = defineStore('connection', {
  state: () => ({
    connections: [],
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchConnections() {
      try {
        this.isLoading = true
        this.error = null
        const response = await api.get(webhooks.connections.list)

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        this.connections = Array.isArray(response.data) 
          ? response.data
              .filter(connection => connection && connection.id && Object.keys(connection).length > 1)
              .map(connection => ({
                ...connection,
                id: String(connection.id),
                companyId: connection.companyId ? String(connection.companyId) : null
              }))
          : []
      } catch (error) {
        console.error('Erro ao buscar conexões:', error)
        this.error = error.message || 'Erro ao buscar conexões'
        this.connections = []
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createConnection(connection) {
      try {
        this.isLoading = true
        this.error = null
        const response = await api.post(webhooks.connections.create, connection)

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        await this.fetchConnections()
        return response.data
      } catch (error) {
        console.error('Erro ao criar conexão:', error)
        this.error = error.message || 'Erro ao criar conexão'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async connectConnection(connectionId) {
      try {
        this.error = null
        const response = await api.post(webhooks.connections.connect, { id: String(connectionId) })

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        return response.data
      } catch (error) {
        console.error('Erro ao conectar:', error)
        this.error = error.message || 'Erro ao conectar'
        throw error
      }
    },

    async deleteConnection(connection) {
      try {
        this.error = null
        await api.delete(webhooks.connections.delete, {
          data: {
            id: String(connection.id),
            name: connection.name,
            status: connection.status
          }
        })
        await this.fetchConnections()
        return true
      } catch (error) {
        console.error('Erro ao excluir conexão:', error)
        this.error = error.message || 'Erro ao excluir conexão'
        throw error
      }
    },

    async connectInstance(connectionName) {
      try {
        this.error = null
        const response = await api.post(webhooks.connections.connect, { name: connectionName })

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        return response.data
      } catch (error) {
        console.error('Erro ao conectar instância:', error)
        this.error = error.message || 'Erro ao conectar instância'
        throw error
      }
    },

    async checkConnectionStatus(connectionName) {
      try {
        this.error = null
        const response = await api.post(webhooks.connections.state, { name: connectionName })

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        return response.data
      } catch (error) {
        console.error('Erro ao verificar estado da conexão:', error)
        this.error = error.message || 'Erro ao verificar estado da conexão'
        throw error
      }
    },

    async cancelConnection(connectionName) {
      try {
        this.error = null
        const response = await api.post(webhooks.connections.disconnect, { name: connectionName })

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        return response.data
      } catch (error) {
        console.error('Erro ao cancelar conexão:', error)
        this.error = error.message || 'Erro ao cancelar conexão'
        throw error
      }
    }
  }
})