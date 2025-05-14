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

    async deleteConnection(connection) {
      try {
        this.isLoading = true
        await api.delete(webhooks.connections.delete, { data: { id: connection.id, name: connection.name, status: connection.status } })
        await this.fetchConnections()
        return true
      } catch (error) {
        console.error('Erro ao excluir conexão:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async connectInstance(connectionName) {
      try {
        this.isLoading = true
        // Ajuste o endpoint conforme sua API
        const response = await api.post(webhooks.connections.connect, { name: connectionName })
        await this.fetchConnections()
        return response.data
      } catch (error) {
        console.error('Erro ao conectar instância:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async checkConnectionStatus(connectionName) {
      try {
        this.isLoading = true
        const response = await api.post(webhooks.connections.state, { name: connectionName })
        return response.data
      } catch (error) {
        console.error('Erro ao verificar estado da conexão:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})