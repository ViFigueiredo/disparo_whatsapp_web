import { computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useTemplateStore } from '../stores/template'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'

export function useTemplates() {
  const toast = useToast()
  const templateStore = useTemplateStore()

  const templates = computed(() => templateStore.templates)
  const isLoading = computed(() => templateStore.isLoading)
  const error = computed(() => templateStore.error)

  const fetchTemplates = async () => {
    try {
      await templateStore.fetchTemplates()
    } catch (error) {
      toast.error('Erro ao carregar templates')
      throw error
    }
  }

  const createTemplate = async (templateData) => {
    try {
      await templateStore.createTemplate(templateData)
      toast.success('Template criado com sucesso!')
      return true
    } catch (error) {
      toast.error('Erro ao criar template')
      return false
    }
  }

  const updateTemplate = async (templateData) => {
    try {
      await templateStore.updateTemplate(templateData)
      toast.success('Template atualizado com sucesso!')
      return true
    } catch (error) {
      toast.error('Erro ao atualizar template')
      return false
    }
  }

  const deleteTemplate = async (templateId) => {
    try {
      await templateStore.deleteTemplate(templateId)
      toast.success('Template excluído com sucesso!')
      return true
    } catch (error) {
      toast.error('Erro ao excluir template')
      return false
    }
  }

  const executeTemplate = async (templateData) => {
    try {
      const response = await api.post(webhooks.templates.execute, templateData)
      toast.success('Template executado com sucesso!')
      return response.data
    } catch (error) {
      console.error('Erro ao executar template:', error)
      toast.error('Erro ao executar template: ' + (error.message || 'Erro desconhecido'))
      return false
    }
  }

  const fetchBusinessTemplates = async (connection) => {
    try {
      const response = await api.get(`${webhooks.business.templates}?connection=${connection}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar templates de negócio:', error)
      toast.error('Erro ao buscar templates de negócio')
      return []
    }
  }

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    executeTemplate,
    fetchBusinessTemplates
  }
} 