<template>
  <div class="space-y-6">
    <loading-overlay v-if="isLoading" message="Carregando listas..." />

    <leads-header @upload-list="openUploadModal" />

    <!-- Lista de Validações -->
    <div class="grid grid-cols-1 gap-4">
      <validation-list-item
        v-for="list in validationLists"
        :key="list.id"
        :list="list"
        @download="downloadValidatedCSV"
        @deleted="handleListDeleted"
      />
    </div>

    <!-- Modal de Upload -->
    <base-modal
      v-model="showUploadModal"
      title="Upload de Lista de Leads"
    >
      <upload-form
        :form="form"
        :is-submitting="isSubmitting"
        @file-upload="handleFileUpload"
        @validate="validateLeads"
        @submit="handleSubmit"
        @cancel="closeUploadModal"
      />
    </base-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLeads } from '../composables/useLeads'

// Components
import BaseModal from '../components/common/BaseModal.vue'
import ValidationListItem from '../components/validation/ValidationListItem.vue'
import LeadsHeader from '../components/leads/LeadsHeader.vue'
import UploadForm from '../components/leads/UploadForm.vue'
import LoadingOverlay from '../components/common/LoadingOverlay.vue'

// Composables
const { 
  isLoading, 
  validationLists,
  fetchValidationLists,
  validateLeads: validateLeadsList,
  saveValidationList,
  downloadValidatedCSV
} = useLeads()

// State
const showUploadModal = ref(false)
const isSubmitting = ref(false)
const form = ref({
  name: '',
  leads: [],
  validated: false
})

// Methods
const openUploadModal = () => {
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    leads: [],
    validated: false
  }
}

const processTabularFormat = (lines, event) => {
  try {
    const headerLine = lines[0].toLowerCase().trim()
    const headers = headerLine.includes('\t') 
      ? headerLine.split('\t').map(h => h.trim()) 
      : headerLine.split(/\s+/).map(h => h.trim())
    
    const nomeIndex = headers.findIndex(h => h.includes('nome'))
    const numeroIndex = headers.findIndex(h => h.includes('numero'))
    
    if (nomeIndex === -1 || numeroIndex === -1) {
      toast.error('O arquivo deve conter as colunas "nome" e "numero"')
      event.target.value = ''
      return
    }
    
    form.value.leads = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const values = line.includes('\t') 
        ? line.split('\t').map(v => v.trim()) 
        : line.split(/\s+/).map(v => v.trim())
      
      if (values.length <= Math.max(nomeIndex, numeroIndex)) continue
      
      let nome = values[nomeIndex] || ''
      let numero = values[numeroIndex] || ''
      
      if (nomeIndex + 1 < numeroIndex) {
        nome = values.slice(nomeIndex, numeroIndex).join(' ').trim()
      }
      
      if (numero) {
        numero = processNumero(numero)
      }
      
      if (nome && numero && numero.length >= 10) {
        form.value.leads.push({ nome, numero })
      }
    }
    
    if (form.value.leads.length > 0) {
      toast.success(`${form.value.leads.length} leads carregados com sucesso!`)
    } else {
      toast.warning('Nenhum lead válido encontrado no arquivo')
      event.target.value = ''
    }
  } catch (error) {
    console.error('Erro ao processar arquivo tabular:', error)
    toast.error('Erro ao processar o arquivo')
    event.target.value = ''
  }
}

const processCSVFormat = (lines, event) => {
  try {
    const headerLine = lines[0].toLowerCase().trim()
    const headers = headerLine.split(',').map(h => h.trim())
    
    const nomeIndex = headers.findIndex(h => h.includes('nome'))
    const numeroIndex = headers.findIndex(h => h.includes('numero'))
    
    if (nomeIndex === -1 || numeroIndex === -1) {
      toast.error('O arquivo CSV deve conter as colunas "nome" e "numero"')
      event.target.value = ''
      return
    }

    form.value.leads = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
        
        let numero = values[numeroIndex] || ''
        if (numero) {
          numero = processNumero(numero)
        }

        return {
          nome: values[nomeIndex] || '',
          numero: numero
        }
      })
      .filter(lead => lead.nome && lead.numero && lead.numero.length >= 10)

    if (form.value.leads.length > 0) {
      toast.success(`${form.value.leads.length} leads carregados com sucesso!`)
    } else {
      toast.warning('Nenhum lead válido encontrado no arquivo')
      event.target.value = ''
    }
  } catch (error) {
    console.error('Erro ao processar arquivo CSV:', error)
    toast.error('Erro ao processar o arquivo')
    event.target.value = ''
  }
}

const processNumero = (numero) => {
  if (!numero) return ''
  
  try {
    if (numero.includes('E') || numero.includes('e')) {
      const normalizedNumber = numero.replace(',', '.')
      const numberValue = Number(normalizedNumber)
      if (!isNaN(numberValue)) {
        return Math.round(numberValue).toString()
      }
    } else if (numero.includes(',')) {
      numero = numero.replace(',', '.')
      const numberValue = Number(numero)
      if (!isNaN(numberValue)) {
        return Math.round(numberValue).toString()
      }
    }
    
    return numero.replace(/[^\d]/g, '')
  } catch (error) {
    console.error('Erro ao processar número:', error)
    return numero.replace(/[^\d]/g, '')
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const cleanText = text.replace(/^\uFEFF/, '').trim()
      const lines = cleanText.split(/\r?\n/).filter(line => line.trim())
      const firstLine = lines[0].trim()
      const isTabular = !firstLine.includes(',') && (firstLine.includes('\t') || firstLine.split(/\s+/).length > 1)
      
      if (isTabular) {
        processTabularFormat(lines, event)
      } else {
        processCSVFormat(lines, event)
      }
    }
    reader.readAsText(file)
  }
}

const validateLeads = async () => {
  if (!form.value.leads || !Array.isArray(form.value.leads)) {
    toast.error('Nenhum lead para validar')
    return
  }

  const validatedLeads = await validateLeadsList(form.value.leads)
  form.value.leads = validatedLeads
  form.value.validated = true
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const listData = {
      name: form.value.name,
      leads: form.value.leads,
      totalLeads: form.value.leads.length,
      validLeads: form.value.leads.filter(lead => lead.exists).length,
      invalidLeads: form.value.leads.filter(lead => !lead.exists).length,
      createdAt: new Date().toISOString()
    }

    await saveValidationList(listData)
    showUploadModal.value = false
    resetForm()
  } finally {
    isSubmitting.value = false
  }
}

const handleListDeleted = (listId) => {
  validationLists.value = validationLists.value.filter(list => list.id !== listId)
}

// Lifecycle
onMounted(() => {
  fetchValidationLists()
})
</script>

<style scoped></style>