import { defineStore } from 'pinia'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'

export const useValidationStore = defineStore('validation', {
  state: () => ({
    lists: [],
    leads: [],
    isLoading: false,
    error: null,
    lastOperation: null
  }),

  getters: {
    formattedLists: (state) => {
      return state.lists.map(list => ({
        ...list,
        valid_leads_percentage: list.total_leads > 0 
          ? Math.round((list.valid_leads / list.total_leads) * 100) 
          : 0
      }))
    },
    
    formattedLeads: (state) => {
      return state.leads.map(lead => ({
        ...lead,
        status: lead.exists ? 'Válido' : 'Inválido',
        status_class: lead.exists ? 'success' : 'danger'
      }))
    }
  },

  actions: {
    async fetchLists() {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'fetch'
        
        const response = await api.get(webhooks.validation.list)
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Formato de resposta inválido')
        }

        if (response.data.length < 2) {
          throw new Error('Dados incompletos recebidos da API')
        }

        const fetchedLeads = response.data[0]?.leads || []
        const fetchedLists = response.data[1]?.lists || []

        this.leads = fetchedLeads.filter(lead => this.isValidLeadItem(lead))
        
        // Filtrar listas e registrar itens inválidos
        this.lists = fetchedLists.filter(list => {
          const isValid = this.isValidListItem(list);
          return isValid;
        });
      } catch (error) {
        console.error('Erro ao buscar listas de validação:', error)
        this.error = error.message || 'Erro ao buscar listas'
        this.leads = []
        this.lists = []
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async saveList(list) {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'save'

        if (!this.validateListData(list)) {
          throw new Error('Dados da lista inválidos')
        }

        const response = await api.post(webhooks.validation.save, list)
        
        if (!response.data) {
          throw new Error('Resposta inválida ao salvar lista')
        }

        await this.fetchLists()
        return response.data
      } catch (error) {
        console.error('Erro ao salvar lista:', error)
        this.error = error.message || 'Erro ao salvar lista'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteList(listId) {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'delete'

        if (!listId) {
          throw new Error('ID da lista não fornecido')
        }

        await api.delete(webhooks.validation.delete, { data: { id: listId } })
        await this.fetchLists()
        return true
      } catch (error) {
        console.error('Erro ao excluir lista:', error)
        this.error = error.message || 'Erro ao excluir lista'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async validateList(listId) {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'validate'

        if (!listId) {
          throw new Error('ID da lista não fornecido')
        }

        const response = await api.post(webhooks.validation.validate, { id: listId })
        
        if (!response.data) {
          throw new Error('Resposta inválida ao validar lista')
        }

        await this.fetchLists()
        return response.data
      } catch (error) {
        console.error('Erro ao validar lista:', error)
        this.error = error.message || 'Erro ao validar lista'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    validateListData(list) {
      return list && 
             typeof list === 'object' && 
             Array.isArray(list.leads) && 
             list.leads.length > 0 &&
             list.leads.every(lead => 
               lead && 
               typeof lead === 'object' && 
               typeof lead.nome === 'string' && 
               typeof lead.numero === 'string'
             )
    },

    isValidListItem(item) {
      return item &&
             typeof item === 'object' &&
             item.id !== undefined &&
             item.id !== null &&
             typeof item.name === 'string' &&
             typeof item.total_leads === 'number' &&
             item.total_leads >= 0 &&
             typeof item.valid_leads === 'number' &&
             item.valid_leads >= 0 &&
             typeof item.invalid_leads === 'number' &&
             item.invalid_leads >= 0 &&
             typeof item.created_at === 'string' &&
             new Date(item.created_at).toString() !== 'Invalid Date';
    },

    isValidLeadItem(lead) {
      return lead &&
             typeof lead === 'object' &&
             typeof lead.nome === 'string' &&
             typeof lead.numero === 'string' &&
             typeof lead.exists === 'boolean';
    }
  }
}) 