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
        const response = await api.get(webhooks.connections.list)
        
        // Verificar se os dados são válidos
        if (Array.isArray(response.data)) {
          this.connections = response.data.filter(connection => 
            connection && connection.id && Object.keys(connection).length > 1
          )
        } else {
          console.warn('Formato de dados inválido recebido da API de conexões')
          this.connections = []
        }
      } catch (error) {
        console.error('Erro ao buscar conexões:', error)
        this.error = error.message
        this.connections = []
      } finally {
        this.isLoading = false
      }
    },

    async createConnection(connection) {
      try {
        this.isLoading = true
        const response = await api.post(webhooks.connections.create, connection)
        await this.fetchConnections()
        return response.data
      } catch (error) {
        console.error('Erro ao criar conexão:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async connectConnection(connectionId) {
      try {
        this.isLoading = true
        const response = await api.post(webhooks.connections.connect, { id: connectionId })
        await this.fetchConnections()
        return response.data
      } catch (error) {
        console.error('Erro ao conectar:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getConnectionState(connectionId) {
      try {
        this.isLoading = true
        const response = await api.get(`${webhooks.connections.state}?id=${connectionId}`)
        return response.data
      } catch (error) {
        console.error('Erro ao buscar estado da conexão:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteConnection(connectionId) {
      try {
        this.isLoading = true
        await api.delete(webhooks.connections.delete, { data: { id: connectionId } })
        await this.fetchConnections()
        return true
      } catch (error) {
        console.error('Erro ao excluir conexão:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})