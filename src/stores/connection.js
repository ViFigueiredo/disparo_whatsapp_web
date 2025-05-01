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
    },

    async createConnection(connectionData) {
      try {
        // Verificar se existe um endpoint para criação de conexões no webhooks.js
        if (!webhooks.connections.create) {
          throw new Error('Endpoint para criação de conexões não configurado')
        }
        
        const response = await fetch(webhooks.connections.create, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(connectionData)
        })
        
        if (!response.ok) {
          throw new Error(`Erro ao criar conexão: ${response.status}`)
        }
        
        const data = await response.json()
        return data
      } catch (error) {
        console.error('Erro ao criar conexão:', error)
        this.error = error.message
        throw error
      }
    },
    
    async connectInstance(connectionName) {
      try {
        console.log('Conectando instância com nome:', connectionName);
        
        const response = await fetch(`${webhooks.connections.connect}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: connectionName })  // Alterado para 'name' se o webhook esperar essa chave
        })
        
        if (!response.ok) {
          throw new Error(`Erro ao conectar instância: ${response.status}`)
        }
        
        return await response.json()
      } catch (error) {
        console.error('Erro ao conectar instância:', error)
        this.error = error.message
        throw error
      }
    },
    
    async checkConnectionStatus(connectionId) {
      try {
        const response = await fetch(`${webhooks.connections.list}/${connectionId}/status`)
        
        if (!response.ok) {
          throw new Error(`Erro ao verificar status da conexão: ${response.status}`)
        }
        
        return await response.json()
      } catch (error) {
        console.error('Erro ao verificar status da conexão:', error)
        this.error = error.message
        throw error
      }
    },
    
    async cancelConnection(connectionId) {
      try {
        const response = await fetch(`${webhooks.connections.connect}/${connectionId}/cancel`, {
          method: 'POST'
        })
        
        if (!response.ok) {
          throw new Error(`Erro ao cancelar conexão: ${response.status}`)
        }
        
        return await response.json()
      } catch (error) {
        console.error('Erro ao cancelar conexão:', error)
        this.error = error.message
        throw error
      }
    }
  }
})