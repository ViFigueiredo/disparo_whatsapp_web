<template>
  <div class="space-y-6 relative">
    <!-- Overlay de Loading -->
    <div 
      v-if="isLoading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
    >
      <div class="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
        <p class="text-gray-700">{{ currentTemplate ? 'Atualizando' : 'Criando' }} template...</p>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Templates de Mensagem</h2>
      <base-button @click="openCreateModal">
        <i class="fas fa-plus mr-2"></i>
        Novo Template
      </base-button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <template-card
        v-for="template in templates"
        :key="template.id"
        :template="template"
        @edit="openEditModal"
        @clone="cloneTemplate"
        @preview="showPreview"
        @validate="validateTemplate"
        @delete="deleteTemplate"
        @execute="executeTemplate"
      />
    </div>

    <base-modal
      v-model="showTemplateModal"
      :title="getModalTitle"
    >
      <template-form
        :template="currentTemplate"
        @submit="handleTemplateSubmit"
        @cancel="closeTemplateModal"
      />
    </base-modal>

    <base-modal
      v-model="showPreviewModal"
      title="Preview do Template"
    >
      <div class="bg-gray-50 p-4 rounded-lg">
        <pre class="whitespace-pre-wrap">{{ previewData }}</pre>
      </div>
    </base-modal>
    
    <template-details-modal
      v-if="selectedTemplate"
      v-model:show="showDetailsModal"
      :template="selectedTemplate"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useTemplateStore } from '../stores/template'
import { useToast } from 'vue-toastification'
import BaseButton from '../components/common/BaseButton.vue'
import BaseModal from '../components/common/BaseModal.vue'
import TemplateCard from '../components/templates/TemplateCard.vue'
import TemplateForm from '../components/templates/TemplateForm.vue'
import TemplateDetailsModal from '../components/templates/TemplateDetailsModal.vue'

const toast = useToast()
const templateStore = useTemplateStore()
const showTemplateModal = ref(false)
const showPreviewModal = ref(false)
const showDetailsModal = ref(false) // Added missing ref
const currentTemplate = ref(null)
const previewData = ref(null)
const selectedTemplate = ref(null) // Added missing ref

const templates = ref([])

onMounted(async () => {
  await templateStore.fetchTemplates()
  templates.value = templateStore.templates
})

const openCreateModal = () => {
  currentTemplate.value = null
  showTemplateModal.value = true
}

const openEditModal = (template) => {
  currentTemplate.value = { ...template }
  showTemplateModal.value = true
}

const closeTemplateModal = () => {
  showTemplateModal.value = false
  currentTemplate.value = null
}

const isLoading = ref(false)

const handleTemplateSubmit = async (template) => {
  isLoading.value = true
  try {
    if (currentTemplate.value && currentTemplate.value.id) {
      // Se tem ID, é uma atualização
      const templateWithId = {
        ...template,
        id: currentTemplate.value.id
      }
      await templateStore.updateTemplate(templateWithId)
      toast.success('Template atualizado com sucesso')
    } else {
      // Se não tem ID, é uma criação (incluindo clonagem)
      await templateStore.createTemplate(template)
      toast.success('Template criado com sucesso')
    }
    
    // Atualiza a lista de templates
    await templateStore.fetchTemplates()
    templates.value = templateStore.templates
    
    // Fecha o modal
    closeTemplateModal()
  } catch (error) {
    console.error('Erro ao salvar template:', error)
    toast.error('Erro ao salvar template')
  } finally {
    isLoading.value = false
  }
}

// Mantenha apenas esta implementação simples da clonagem
const cloneTemplate = (template) => {
  const clonedTemplate = JSON.parse(JSON.stringify(template)) // cópia profunda
  currentTemplate.value = {
    ...clonedTemplate,
    id: null,
    name: `${template.name} (Cópia)`
  }
  showTemplateModal.value = true
}

const showPreview = (template) => {
  // console.log('Template selecionado:', template) // Adicionar log para debug
  if (template) {
    selectedTemplate.value = { ...template } // Criar uma cópia do template
    showDetailsModal.value = true
  }
}

const validateTemplate = async (template) => {
  await templateStore.validateTemplate(template)
}



const deleteTemplate = async (template) => {
  if (!confirm('Tem certeza que deseja excluir este template?')) {
    return
  }

  try {
    await templateStore.deleteTemplate(template.id)
    // Atualiza a referência local dos templates
    templates.value = templateStore.templates
    toast.success('Template excluído com sucesso')
  } catch (error) {
    console.error('Erro ao excluir template:', error)
    toast.error('Erro ao excluir template')
  }
}

// Adiciona um watcher para manter a lista local sincronizada
// Simplifica o watch para evitar loops desnecessários
watch(
  () => templateStore.templates,
  (newTemplates) => {
    if (newTemplates) {
      templates.value = newTemplates
    }
  }
)

// Remove a função handleClone que não está sendo usada
// Adicione esta computed property no script
const getModalTitle = computed(() => {
  if (!currentTemplate.value) return 'Novo Template'
  if (currentTemplate.value.id) return 'Editar Template'
  return 'Clonar Template'
})

const executeTemplate = async (template) => {
  try {
    isLoading.value = true
    
    // Verificar se o template tem todos os dados necessários
    if (!template.template_list_id) {
      toast.warning('Este template não possui uma lista de validação associada')
      return
    }
    
    // Executar o template com todos os dados
    const result = await templateStore.executeTemplate(template)
    
    // Mostrar mensagem de sucesso com detalhes
    toast.success(`Disparo iniciado com sucesso! ${result.message || ''}`)
    
    // Opcional: Mostrar detalhes adicionais do disparo
    console.log('Detalhes do disparo:', result)
    
  } catch (error) {
    console.error('Erro ao executar template:', error)
    toast.error(`Erro ao executar disparo: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}
</script>