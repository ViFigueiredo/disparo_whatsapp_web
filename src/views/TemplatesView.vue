<template>
  <div class="space-y-6">
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
      />
    </div>

    <base-modal
      v-model="showTemplateModal"
      :title="currentTemplate ? 'Editar Template' : 'Novo Template'"
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
import { ref, onMounted } from 'vue'
import { useTemplateStore } from '../stores/template'
import { useToast } from 'vue-toastification'
import BaseButton from '../components/common/BaseButton.vue'
import BaseModal from '../components/common/BaseModal.vue'
import TemplateCard from '../components/templates/TemplateCard.vue'
import TemplateForm from '../components/templates/TemplateForm.vue'
import TemplateDetailsModal from '../components/templates/TemplateDetailsModal.vue'

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

const handleTemplateSubmit = async (template) => {
  if (currentTemplate.value) {
    await templateStore.updateTemplate(template)
  } else {
    await templateStore.createTemplate(template)
  }
  closeTemplateModal()
}

const cloneTemplate = (template) => {
  currentTemplate.value = {
    ...template,
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

const toast = useToast()

const deleteTemplate = async (template) => {
  if (!confirm('Tem certeza que deseja excluir este template?')) {
    return
  }

  try {
    await templateStore.deleteTemplate(template.id)
    toast.success('Template excluído com sucesso')
  } catch (error) {
    console.error('Erro ao excluir template:', error)
    toast.error('Erro ao excluir template')
  }
}
</script>

<style scoped></style>