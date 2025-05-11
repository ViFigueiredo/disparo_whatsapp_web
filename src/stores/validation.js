import { defineStore } from 'pinia'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'

export const useValidationStore = defineStore('validation', {
  state: () => ({
    lists: [],
    leads: [],
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchLists() {
      try {
        this.isLoading = true
        const response = await api.get(webhooks.validation.list)
        
        if (Array.isArray(response.data) && response.data.length >= 2) {
          this.leads = response.data[0]?.leads || []
          this.lists = response.data[1]?.lists || []
        } else {
          console.warn('Formato de dados inválido recebido da API de validação')
          this.leads = []
          this.lists = []
        }
      } catch (error) {
        console.error('Erro ao buscar listas de validação:', error)
        this.error = error.message
        this.leads = []
        this.lists = []
      } finally {
        this.isLoading = false
      }
    },

    async saveList(list) {
      try {
        this.isLoading = true
        const response = await api.post(webhooks.validation.save, list)
        await this.fetchLists()
        return response.data
      } catch (error) {
        console.error('Erro ao salvar lista:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteList(listId) {
      try {
        this.isLoading = true
        await api.delete(webhooks.validation.delete, { data: { id: listId } })
        await this.fetchLists()
        return true
      } catch (error) {
        console.error('Erro ao excluir lista:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async validateList(listId) {
      try {
        this.isLoading = true
        const response = await api.post(webhooks.validation.validate, { id: listId })
        await this.fetchLists()
        return response.data
      } catch (error) {
        console.error('Erro ao validar lista:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
}) 