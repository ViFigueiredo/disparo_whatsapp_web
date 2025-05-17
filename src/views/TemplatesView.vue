<template>
  <div class="space-y-6 relative">
    <loading-overlay v-if="isLoading" message="Carregando templates..." />

    <templates-header @new-template="openCreateModal" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <template-card v-for="template in filteredTemplates" :key="template.id" :template="template" @edit="openEditModal"
        @clone="cloneTemplate" @preview="showPreview" @validate="validateTemplate" @delete="deleteTemplate"
        @execute="executeTemplate" />
    </div>

    <base-modal v-model="showTemplateModal" :title="getModalTitle">
      <template-form :template="currentTemplate" :is-submitting="isSubmitting" :companies="isAdmin ? companies : []"
        :is-admin="isAdmin" :validationLists="filteredValidationLists" @submit="handleTemplateSubmit"
        @cancel="closeTemplateModal" />
    </base-modal>

    <base-modal v-model="showPreviewModal" title="Preview do Template">
      <div class="bg-gray-50 p-4 rounded-lg">
        <pre class="whitespace-pre-wrap">{{ previewData }}</pre>
      </div>
    </base-modal>

    <template-details-modal v-if="selectedTemplate" v-model:show="showDetailsModal" :template="selectedTemplate" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTemplates } from '../composables/useTemplates'
import { useAuth } from '../composables/useAuth'
import { useCompanies } from '../composables/useCompanies'
import { useLeads } from '../composables/useLeads'

// Components
import BaseModal from '../components/common/BaseModal.vue'
import TemplateCard from '../components/templates/TemplateCard.vue'
import TemplateForm from '../components/templates/TemplateForm.vue'
import TemplateDetailsModal from '../components/templates/TemplateDetailsModal.vue'
import TemplatesHeader from '../components/templates/TemplatesHeader.vue'
import LoadingOverlay from '../components/common/LoadingOverlay.vue'

// Composables
const { user, isAdmin } = useAuth()
const { companies, fetchCompanies } = useCompanies()
const {
  isLoading,
  templates,
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate: removeTemplate,
  validateTemplate: validateTemplateAction,
  executeTemplate: executeTemplateAction
} = useTemplates()

const { validationLists, fetchValidationLists } = useLeads()

// State
const showTemplateModal = ref(false)
const showPreviewModal = ref(false)
const showDetailsModal = ref(false)
const currentTemplate = ref(null)
const previewData = ref(null)
const selectedTemplate = ref(null)
const isSubmitting = ref(false)

// Computed
const getModalTitle = computed(() => {
  if (!currentTemplate.value) return 'Novo Template'
  if (currentTemplate.value.id) return 'Editar Template'
  return 'Clonar Template'
})

const filteredTemplates = computed(() => {
  if (isAdmin.value) return templates.value
  return templates.value.filter(template => template.company_id === user.value.company_id)
})

const filteredValidationLists = computed(() => {
  if (isAdmin.value) {
    return validationLists.value
  } else {
    return validationLists.value.filter(list =>
      list.company_id === user.value.company_id
    )
  }
})

// Methods
const openCreateModal = () => {
  currentTemplate.value = {
    company_id: user.value.company_id // Define empresa padrão como a do usuário
  }
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

const cloneTemplate = (template) => {
  const clonedTemplate = JSON.parse(JSON.stringify(template))
  currentTemplate.value = {
    ...clonedTemplate,
    id: null,
    name: `${template.name} (Cópia)`
  }
  showTemplateModal.value = true
}

const showPreview = (template) => {
  if (template) {
    selectedTemplate.value = template
    showDetailsModal.value = true
  }
}

const validateTemplate = async (template) => {
  await validateTemplateAction(template)
}

const deleteTemplate = async (template) => {
  if (!confirm('Tem certeza que deseja excluir este template?')) {
    return
  }
  await removeTemplate(template.id)
}

const executeTemplate = async (template) => {
  await executeTemplateAction(template)
}

const handleTemplateSubmit = async (template) => {
  isSubmitting.value = true
  try {
    if (currentTemplate.value && currentTemplate.value.id) {
      await updateTemplate({
        ...template,
        id: currentTemplate.value.id
      })
    } else {
      await createTemplate(template)
    }
    closeTemplateModal()
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  if (isAdmin.value) {
    await fetchCompanies()
  }
  await fetchTemplates()
  await fetchValidationLists()
})
</script>