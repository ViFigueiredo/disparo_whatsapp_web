import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useTemplateStore } from '../stores/template'

export function useTemplates() {
  const toast = useToast()
  const templateStore = useTemplateStore()
  const isLoading = ref(false)
  const templates = ref([])

  const fetchTemplates = async () => {
    try {
      isLoading.value = true
      await templateStore.fetchTemplates()
      
      // Filtrar templates vazios ou inválidos
      if (Array.isArray(templateStore.templates)) {
        templates.value = templateStore.templates.filter(template => {
          return template && template.id && Object.keys(template).length > 1
        })
      } else {
        templates.value = []
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
      toast.error('Erro ao carregar templates')
      templates.value = []
    } finally {
      isLoading.value = false
    }
  }

  const createTemplate = async (templateData) => {
    try {
      isLoading.value = true
      await templateStore.createTemplate(templateData)
      toast.success('Template criado com sucesso')
      await fetchTemplates()
      return true
    } catch (error) {
      console.error('Erro ao criar template:', error)
      toast.error('Erro ao criar template')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const updateTemplate = async (templateData) => {
    try {
      isLoading.value = true
      await templateStore.updateTemplate(templateData)
      toast.success('Template atualizado com sucesso')
      await fetchTemplates()
      return true
    } catch (error) {
      console.error('Erro ao atualizar template:', error)
      toast.error('Erro ao atualizar template')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const deleteTemplate = async (templateId) => {
    try {
      isLoading.value = true
      await templateStore.deleteTemplate(templateId)
      toast.success('Template excluído com sucesso')
      await fetchTemplates()
      return true
    } catch (error) {
      console.error('Erro ao excluir template:', error)
      toast.error('Erro ao excluir template')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const validateTemplate = async (template) => {
    try {
      isLoading.value = true
      await templateStore.validateTemplate(template)
      toast.success('Template validado com sucesso')
      return true
    } catch (error) {
      console.error('Erro ao validar template:', error)
      toast.error('Erro ao validar template')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const executeTemplate = async (template) => {
    try {
      isLoading.value = true
      
      if (!template.template_list_id) {
        toast.warning('Este template não possui uma lista de validação associada')
        return false
      }

      const result = await templateStore.executeTemplate(template)
      toast.success(`Disparo iniciado com sucesso! ${result.message || ''}`)
      return true
    } catch (error) {
      console.error('Erro ao executar template:', error)
      toast.error(`Erro ao executar disparo: ${error.message}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    templates,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    validateTemplate,
    executeTemplate
  }
} 