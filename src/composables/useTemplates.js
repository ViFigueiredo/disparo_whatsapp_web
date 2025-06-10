import { computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useTemplateStore } from '../stores/template'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'

export function useTemplates() {
  const toast = useToast()
  const templateStore = useTemplateStore()

  const templates = computed(() => templateStore.formattedTemplates)
  const isLoading = computed(() => templateStore.isLoading)
  const error = computed(() => templateStore.error)
  const lastOperation = computed(() => templateStore.lastOperation)

  const handleError = (error, message) => {
    console.error(message, error)
    toast.error(message + (error.message ? `: ${error.message}` : ''))
    return false
  }

  const fetchTemplates = async () => {
    try {
      await templateStore.fetchTemplates()
      return true
    } catch (error) {
      return handleError(error, 'Erro ao carregar templates')
    }
  }

  const createTemplate = async (templateData) => {
    try {
      await templateStore.createTemplate(templateData)
      toast.success('Template criado com sucesso!')
      return true
    } catch (error) {
      return handleError(error, 'Erro ao criar template')
    }
  }

  const updateTemplate = async (templateData) => {
    try {
      await templateStore.updateTemplate(templateData)
      toast.success('Template atualizado com sucesso!')
      return true
    } catch (error) {
      return handleError(error, 'Erro ao atualizar template')
    }
  }

  const deleteTemplate = async (templateId) => {
    try {
      await templateStore.deleteTemplate(templateId)
      toast.success('Template excluído com sucesso!')
      return true
    } catch (error) {
      return handleError(error, 'Erro ao excluir template')
    }
  }

  const executeTemplate = async (templateData) => {
    try {
      const response = await templateStore.executeTemplate(templateData)
      toast.success('Template executado com sucesso!')
      return response
    } catch (error) {
      return handleError(error, 'Erro ao executar template')
    }
  }

  const fetchBusinessTemplates = async (connection) => {
    try {
      const response = await api.get(`${webhooks.business.templates}?connection=${connection}`)
      return response.data
    } catch (error) {
      return handleError(error, 'Erro ao buscar templates de negócio')
    }
  }

  return {
    templates,
    isLoading,
    error,
    lastOperation,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    executeTemplate,
    fetchBusinessTemplates
  }
} 