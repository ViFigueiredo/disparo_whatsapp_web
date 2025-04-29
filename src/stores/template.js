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

    // Função para executar o template
    async executeTemplate(template) {
      try {
        this.isLoading = true
        
        // Preparar os dados para envio com todos os detalhes
        const payload = {
          // Dados básicos do template
          template_id: template.id,
          template_name: template.template_name,
          template_message: template.message || template.template_message,
          template_connection: template.template_connection,
          template_list_id: template.template_list_id,
          template_list_name: template.template_list_name,
          
          // Dados da lista de validação
          validationList: template.validationList,
          totalLeads: template.totalLeads,
          
          // Respostas da IA
          aiResponses: template.aiResponses || [],
          
          // Dados adicionais que possam existir
          customFields: template.customFields || [],
          
          // Metadados
          created_at: template.created_at,
          updated_at: template.updated_at
        }
        
        // Enviar para a API
        const response = await fetch(webhooks.templates.execute, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Erro ao executar o template')
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