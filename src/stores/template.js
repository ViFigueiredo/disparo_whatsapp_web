import { defineStore } from 'pinia'
import { webhooks } from '../config/webhooks'

export const useTemplateStore = defineStore('template', {
  state: () => ({
    templates: [],
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchTemplates() {
      try {
        this.isLoading = true
        const response = await fetch(webhooks.templates.list)
        const data = await response.json()
        this.templates = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async createTemplate(template) {
      try {
        this.isLoading = true
        const response = await fetch(webhooks.templates.create, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(template)
        })
        const data = await response.json()
        this.templates.push(data)
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async updateTemplate(template) {
      try {
        this.isLoading = true
        const response = await fetch(webhooks.templates.update, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(template)
        })
        const data = await response.json()
        const index = this.templates.findIndex(t => t.id === template.id)
        if (index !== -1) {
          this.templates[index] = data
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async validateTemplate(template) {
      try {
        this.isLoading = true
        const response = await fetch(webhooks.validation.validate, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(template)
        })
        return await response.json()
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async executeTemplate(template) {
      try {
        this.isLoading = true
        
        // Get the list of leads for this template
        const listId = parseInt(template.template_list_id)
        const leadsResponse = await fetch(webhooks.validation.list)
        
        if (!leadsResponse.ok) {
          throw new Error('Erro ao carregar leads para envio')
        }
        
        const data = await leadsResponse.json()
        const leads = data[0]?.leads || []
        const listLeads = leads.filter(lead => lead.list_id === listId)
        
        if (listLeads.length === 0) {
          throw new Error('Não há leads na lista para envio')
        }
        
        // Prepare the payload for the webhook
        const payload = {
          template_id: template.id,
          template_name: template.template_name,
          message: template.template_message,
          connection: template.template_connection,
          leads: listLeads,
          customFields: template.customFields || []
        }
        
        // Send the request to the execute webhook
        const response = await fetch(webhooks.templates.execute, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          throw new Error('Erro ao executar disparo do template')
        }
        
        return await response.json()
      } catch (error) {
        console.error('Erro ao executar template:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteTemplate(templateId) {
      try {
        this.isLoading = true
        const response = await fetch(webhooks.templates.delete, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: templateId })
        })

        if (!response.ok) {
          throw new Error('Erro ao excluir template')
        }

        // Atualiza a lista local removendo o template excluído
        this.templates = this.templates.filter(template => template.id !== templateId)
        
        // Força uma nova busca dos templates para garantir sincronização
        await this.fetchTemplates()
        
        return true
      } catch (error) {
        console.error('Erro ao excluir template:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})