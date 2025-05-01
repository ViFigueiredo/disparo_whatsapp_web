import { defineStore } from 'pinia'
import { webhooks } from '../config/webhooks'

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
        const response = await fetch(webhooks.connections.list)
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar conexões: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Verificar se os dados são válidos
        if (Array.isArray(data)) {
          this.connections = data.filter(connection => 
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
    }
  }
})