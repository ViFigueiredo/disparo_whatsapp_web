import { defineStore } from 'pinia'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'

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
        const response = await api.get(webhooks.templates.list)
        this.templates = response.data
      } catch (error) {
        console.error('Erro ao buscar templates:', error)
        this.error = error.message
        this.templates = []
      } finally {
        this.isLoading = false
      }
    },

    async createTemplate(template) {
      try {
        this.isLoading = true
        this.error = null
        
        // Preparar os dados para envio
        const payload = {
          template_name: template.name,
          template_message: template.message || '',
          template_connection: template.connection.name,
          template_list_id: template.validationListId,
          template_list_name: template.validationList?.name,
          validationList: template.validationList,
          customFields: template.customFields || [],
          integration_type: template.connection.integration || template.integration_type || null
        }
        
        // Adicionar informações do template de negócio se for uma conexão business
        if (template.connection.integration === 'WHATSAPP-BUSINESS' && template.businessTemplate) {
          payload.businessTemplate = typeof template.businessTemplate === 'object' 
            ? template.businessTemplate.id 
            : template.businessTemplate
                
          if (typeof template.businessTemplate === 'object') {
            payload.business_template_name = template.businessTemplate.name || 'Template de Negócio WhatsApp'
                
            if (template.businessTemplate.language) {
              payload.business_template_language = template.businessTemplate.language
            }
                
            if (template.businessTemplate.category) {
              payload.business_template_category = template.businessTemplate.category
            }
          }
        } else if (template.connection.integration === 'WHATSAPP-BAILEYS') {
          if (template.connection.ownerJid) {
            payload.connection_jid = template.connection.ownerJid
          }
        }
        
        const response = await api.post(webhooks.templates.create, payload)
        
        // Atualizar a lista de templates após a criação
        await this.fetchTemplates()
        
        return response.data
      } catch (error) {
        console.error('Erro ao criar template:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateTemplate(template) {
      try {
        this.isLoading = true
        this.error = null
        
        const response = await api.put(webhooks.templates.update, template)
        
        // Atualizar a lista de templates após a atualização
        await this.fetchTemplates()
        
        return response.data
      } catch (error) {
        console.error('Erro ao atualizar template:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async deleteTemplate(templateId) {
      try {
        this.isLoading = true
        await api.delete(webhooks.templates.delete, { data: { id: templateId } })
        
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
    },

    async executeTemplate(template) {
      try {
        this.isLoading = true
        
        // Função auxiliar para selecionar mensagem aleatória
        const getRandomMessage = (messages) => {
          return messages[Math.floor(Math.random() * messages.length)]
        }
    
        // Extrair os JIDs da lista de validação
        const jids = template.validationList.leads.map(lead => ({
          jid: lead.jid,
          message: getRandomMessage(template.aiResponses)
        }))
        
        // Preparar os dados para envio
        const payload = {
          template_id: template.id,
          template_name: template.template_name,
          template_connection: template.template_connection,
          template_list_id: template.template_list_id,
          template_list_name: template.template_list_name,
          leadsMessages: jids
        }
        
        // Verificar se é uma conexão business
        let isBusinessConnection = false
        
        if (template.template_connection && typeof template.template_connection === 'object') {
          isBusinessConnection = template.template_connection.integration === 'WHATSAPP-BUSINESS'
        } else if (typeof template.template_connection === 'string') {
          isBusinessConnection = template.integration_type === 'WHATSAPP-BUSINESS'
        }
        
        if (isBusinessConnection) {
          if (template.businessTemplate) {
            if (typeof template.businessTemplate === 'object' && template.businessTemplate.name) {
              payload.business_template_name = template.businessTemplate.name
            } else if (template.business_template_name) {
              payload.business_template_name = template.business_template_name
            } else if (typeof template.businessTemplate === 'string') {
              payload.business_template_name = "hello_world"
            } else {
              payload.business_template_name = "hello_world"
            }
          } else {
            payload.business_template_name = "hello_world"
          }
          
          if (typeof template.businessTemplate === 'object' && template.businessTemplate.id) {
            payload.businessTemplate = template.businessTemplate.id
          } else if (typeof template.businessTemplate === 'string') {
            payload.businessTemplate = template.businessTemplate
          }
        }
        
        const response = await api.post(webhooks.templates.execute, payload)
        return response.data
      } catch (error) {
        console.error('Erro ao executar template:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})