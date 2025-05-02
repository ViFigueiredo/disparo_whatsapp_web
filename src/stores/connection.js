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
      let retries = 3;
      let attempt = 0;
      
      while (attempt < retries) {
        try {
          console.log(`Tentativa ${attempt + 1} de conectar instancia:`, connectionName);
          
          const response = await fetch(`${webhooks.connections.connect}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: connectionName })
          });
          
          if (!response.ok) {
            throw new Error(`Error al conectar instancia: ${response.status}`);
          }        
          const data = await response.json();
          console.log('Respuesta recibida:', data);
          return data;
        } catch (error) {
          attempt++;
          console.error(`Error al conectar instancia (intento ${attempt}/${retries}):`, error);
          
          if (attempt >= retries) {
            this.error = error.message;
            throw error;
          }
          
          // Esperar antes de reintentar (tiempo exponencial)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    },
    
    async checkConnectionStatus(connectionName) {
      try {
        console.log('Verificando status da conexão:', connectionName);
        
        const response = await fetch(`${webhooks.connections.state}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: connectionName })
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao verificar status da conexão: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Status da conexão recebido:', data);
        
        // Processar o formato de resposta esperado
        if (Array.isArray(data) && data.length > 0 && data[0].success && Array.isArray(data[0].data)) {
          const connectionData = data[0].data[0];
          
          return {
            connected: connectionData.connectionStatus === 'open',
            connecting: connectionData.connectionStatus === 'connecting',
            status: connectionData.connectionStatus,
            connectionData: connectionData
          };
        } else {
          console.warn('Formato de resposta inválido ao verificar status da conexão');
          return {
            connected: false,
            error: true,
            message: 'Formato de resposta inválido'
          };
        }
      } catch (error) {
        console.error('Erro ao verificar status da conexão:', error);
        this.error = error.message;
        return {
          connected: false,
          error: true,
          message: error.message || 'Erro desconhecido ao verificar status'
        };
      }
    },
    
    async cancelConnection(connectionName) {
      try {
        console.log('Cancelando conexão:', connectionName);
        
        const response = await fetch(`${webhooks.connections.connect}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: connectionName })
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
    },
    
    async removeConnection(connectionName) {
      try {
        console.log('Removendo conexão:', connectionName);
        console.log('URL do webhook de remoção:', webhooks.connections.delete);
        
        // Verificar se o webhook está configurado
        if (!webhooks.connections.delete) {
          console.error('ERRO: URL do webhook de remoção não está configurada!');
          throw new Error('URL do webhook de remoção não está configurada');
        }
        
        // Obter o status atual da conexão antes de removê-la
        let connectionStatus = 'unknown';
        try {
          const statusResponse = await this.checkConnectionStatus(connectionName);
          connectionStatus = statusResponse.status || 'unknown';
          console.log('Status da conexão a ser removida:', connectionStatus);
        } catch (statusError) {
          console.warn('Não foi possível obter o status da conexão antes de removê-la:', statusError);
        }
        
        const payload = { 
          name: connectionName,
          status: connectionStatus 
        };
        console.log('Payload enviado para remoção:', payload);
        
        const response = await fetch(`${webhooks.connections.delete}`, {
          method: 'DELETE', // Alterado de DELETE para POST para garantir compatibilidade
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
          throw new Error(`Erro ao remover conexão: ${response.status}`)
        }
        
        // Atualizar a lista de conexões após a remoção
        await this.fetchConnections()
        
        return await response.json()
      } catch (error) {
        console.error('Erro ao remover conexão:', error)
        this.error = error.message
        throw error
      }
    }
  }
})