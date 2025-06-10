import { defineStore } from 'pinia'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'

export const useTemplateStore = defineStore('template', {
  state: () => ({
    templates: [],
    isLoading: false,
    error: null,
    lastOperation: null
  }),

  getters: {
    formattedTemplates: (state) => {
      return state.templates.map(template => ({
        ...template,
        integration_type: template.integration_type === 'WHATSAPP-BUSINESS' ? 'WhatsApp Business' : 'WhatsApp Baileys',
        status: template.status === 'active' ? 'Ativo' : 'Inativo'
      }))
    }
  },

  actions: {
    async fetchTemplates() {
      try {
        this.isLoading = true
        this.error = null
        const response = await api.get(webhooks.templates.list)

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        this.templates = Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Erro ao buscar templates:', error)
        this.error = error.message || 'Erro ao buscar templates'
        this.templates = []
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async createTemplate(template) {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'create'

        const payload = this.prepareTemplatePayload(template)
        const response = await api.post(webhooks.templates.create, payload)

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        await this.fetchTemplates()
        return response.data
      } catch (error) {
        console.error('Erro ao criar template:', error)
        this.error = error.message || 'Erro ao criar template'
        throw error
      } finally {
        this.isLoading = false
        this.lastOperation = null
      }
    },

    async updateTemplate(template) {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'update'

        if (!template.id) {
          throw new Error('ID do template é obrigatório para atualização')
        }

        const response = await api.put(webhooks.templates.update, template)

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        await this.fetchTemplates()
        return response.data
      } catch (error) {
        console.error('Erro ao atualizar template:', error)
        this.error = error.message || 'Erro ao atualizar template'
        throw error
      } finally {
        this.isLoading = false
        this.lastOperation = null
      }
    },

    async deleteTemplate(templateId) {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'delete'

        await api.delete(webhooks.templates.delete, { data: { id: templateId } })
        await this.fetchTemplates()
        return true
      } catch (error) {
        console.error('Erro ao excluir template:', error)
        this.error = error.message || 'Erro ao excluir template'
        throw error
      } finally {
        this.isLoading = false
        this.lastOperation = null
      }
    },

    async executeTemplate(template) {
      try {
        this.isLoading = true
        this.error = null
        this.lastOperation = 'execute'

        const payload = this.prepareExecutionPayload(template)
        const response = await api.post(webhooks.templates.execute, payload)

        if (!response.data) {
          throw new Error('Resposta inválida da API')
        }

        return response.data
      } catch (error) {
        console.error('Erro ao executar template:', error)
        this.error = error.message || 'Erro ao executar template'
        throw error
      } finally {
        this.isLoading = false
        this.lastOperation = null
      }
    },

    prepareTemplatePayload(template) {
      const payload = {
        template_name: template.name ?? null,
        template_message: template.message ?? null,
        template_connection: template.connection?.name ?? null,
        template_list_id: template.validationListId ?? null,
        template_list_name: template.validationList?.name ?? null,
        validationList: template.validationList ?? null,
        customFields: template.customFields ?? null,
        integration_type: template.connection?.integration ?? template.integration_type ?? null,
        company_id: template.company_id ?? null,
        businessTemplate: null,
        business_template_name: null,
        business_template_language: null,
        business_template_category: null,
        connection_jid: null
      }

      if (template.connection?.integration === 'WHATSAPP-BUSINESS' && template.businessTemplate) {
        payload.businessTemplate = typeof template.businessTemplate === 'object'
          ? template.businessTemplate.id
          : template.businessTemplate

        if (typeof template.businessTemplate === 'object') {
          payload.business_template_name = template.businessTemplate.name || 'Template de Negócio WhatsApp'
          payload.business_template_language = template.businessTemplate.language ?? null
          payload.business_template_category = template.businessTemplate.category ?? null
        }
      } else if (template.connection?.integration === 'WHATSAPP-BAILEYS' && template.connection.ownerJid) {
        payload.connection_jid = template.connection.ownerJid
      }

      return payload
    },

    prepareExecutionPayload(template) {
      const getRandomMessage = (messages) => {
        return messages[Math.floor(Math.random() * messages.length)]
      }

      const jids = template.validationList.leads.map(lead => ({
        jid: lead.jid,
        message: getRandomMessage(template.aiResponses)
      }))

      const payload = {
        template_id: template.id,
        template_name: template.template_name,
        template_connection: template.template_connection,
        template_list_id: template.template_list_id,
        template_list_name: template.template_list_name,
        leadsMessages: jids
      }

      const isBusinessConnection = this.isBusinessConnection(template)

      if (isBusinessConnection) {
        this.addBusinessTemplateInfo(payload, template)
      }

      return payload
    },

    isBusinessConnection(template) {
      if (template.template_connection && typeof template.template_connection === 'object') {
        return template.template_connection.integration === 'WHATSAPP-BUSINESS'
      }
      return template.integration_type === 'WHATSAPP-BUSINESS'
    },

    addBusinessTemplateInfo(payload, template) {
      if (template.businessTemplate) {
        if (typeof template.businessTemplate === 'object' && template.businessTemplate.name) {
          payload.business_template_name = template.businessTemplate.name
        } else if (template.business_template_name) {
          payload.business_template_name = template.business_template_name
        } else {
          payload.business_template_name = "hello_world"
        }

        if (typeof template.businessTemplate === 'object' && template.businessTemplate.id) {
          payload.businessTemplate = template.businessTemplate.id
        } else if (typeof template.businessTemplate === 'string') {
          payload.businessTemplate = template.businessTemplate
        }
      } else {
        payload.business_template_name = "hello_world"
      }
    }
  }
})