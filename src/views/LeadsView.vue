<template>
  <div class="space-y-6">
    <loading-overlay v-if="isLoading" message="Carregando listas..." />

    <leads-header @upload-list="openUploadModal" />

    <!-- Lista de Validações -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome da Lista
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total de Leads
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Números Válidos
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Números Inválidos
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody v-if="filteredValidationLists.length > 0" class="bg-white divide-y divide-gray-200">
            <tr v-for="list in filteredValidationLists" :key="list.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-left">
                <div class="text-sm font-medium text-gray-900">{{ list.name }}</div>
                <div class="text-sm text-gray-500">Criado em: {{ formatDate(list.created_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-left">
                <div class="text-sm text-gray-900">{{ getCompanyName(list.company_id) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="text-sm text-gray-900">{{ list.total_leads }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="text-sm text-green-600 font-medium">{{ list.valid_leads }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="text-sm text-red-600 font-medium">{{ list.invalid_leads }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex justify-center gap-2">
                  <button @click="downloadValidatedCSV(list.id)" class="text-blue-600 hover:text-blue-800"
                    title="Baixar lista">
                    <i class="fas fa-download"></i>
                  </button>
                  <button @click="deleteList(list.id)" class="text-red-600 hover:text-red-800" :disabled="isDeleting"
                    title="Excluir lista">
                    <i v-if="!isDeleting" class="fas fa-trash"></i>
                    <i v-else class="fas fa-spinner fa-spin"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else class="bg-white divide-y divide-gray-200">
            <tr>
              <td colspan="6" class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                Nenhuma lista de validação encontrada.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Upload -->
    <base-modal v-model="showUploadModal" title="Upload de Lista de Leads">
      <div class="mb-4">
        <button @click="downloadTemplate" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <i class="fas fa-download mr-2"></i>
          Baixar Modelo CSV
        </button>
      </div>
      <upload-form :form="form" :is-submitting="isSubmitting" :is-admin="isAdmin" :companies="companies"
        @file-upload="handleFileUpload" @validate="validateLeads" @submit="handleSubmit" @cancel="closeUploadModal" />
    </base-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useLeads } from '../composables/useLeads'
import { useAuth } from '../composables/useAuth'
import { webhooks } from '../config/webhooks'
import { useToast } from 'vue-toastification'

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

const { user } = useAuth()
const toast = useToast()

// State
const showUploadModal = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const companies = ref([])
const form = ref({
  name: '',
  leads: [],
  validated: false,
  companyId: ''
})

// Computed
const isAdmin = computed(() => user.value?.role === 'admin')

// Filtrar listas por empresa
const filteredValidationLists = computed(() => {

  // Verificar se temos dados válidos
  if (!validationLists.value || !Array.isArray(validationLists.value)) {
    return []
  }

  // Se for admin, retorna todas as listas
  if (isAdmin.value) {
    return validationLists.value
  }

  // Filtrar por company_id
  const filtered = validationLists.value.filter(list => {
    const listCompanyId = String(list.company_id)
    const userCompanyId = String(user.value.company_id)
    return listCompanyId === userCompanyId
  })

  return filtered
})

// Debugging: Watch filteredValidationLists
watch(filteredValidationLists, (newValue) => {
  console.log('filteredValidationLists changed:', newValue);
}, { immediate: true });

// Methods
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const deleteList = async (listId) => {
  if (isDeleting.value) return

  try {
    isDeleting.value = true
    const response = await fetch(webhooks.validation.delete, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: listId })
    })

    if (!response.ok) {
      throw new Error('Erro ao excluir lista')
    }

    await fetchValidationLists()
    toast.success('Lista excluída com sucesso!')
  } catch (error) {
    console.error('Erro ao excluir lista:', error)
    toast.error('Erro ao excluir lista')
  } finally {
    isDeleting.value = false
  }
}

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
    validated: false,
    companyId: ''
  }
}

const fetchCompanies = async () => {
  try {
    let response
    if (isAdmin.value) {
      response = await fetch(webhooks.companies.list)
    } else {
      response = await fetch(webhooks.companies.listone, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: user.value.company_id })
      })
    }
    if (!response.ok) throw new Error('Erro ao carregar empresas')
    
    const data = await response.json()
    companies.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Erro ao carregar empresas:', error)
    toast.error('Erro ao carregar lista de empresas')
  }
}

const getCompanyName = (companyId) => {
  const companiesArr = Array.isArray(companies.value) ? companies.value : Array.from(companies.value)
  console.log('companiesArr', companiesArr)
  console.log('procurando companyId', companyId)
  const company = companiesArr.find(c => String(c.id) === String(companyId))
  console.log('company encontrado', company)
  return company ? company.name : 'N/A'
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

    const processedLeads = lines.slice(1)
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

    if (processedLeads.length > 0) {
      form.value.leads = processedLeads
      toast.success(`${processedLeads.length} leads carregados com sucesso!`)
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

      if (lines.length === 0) {
        toast.error('O arquivo está vazio')
        event.target.value = ''
        return
      }

      const firstLine = lines[0].trim()
      const isTabular = !firstLine.includes(',') && (firstLine.includes('\t') || firstLine.split(/\s+/).length > 1)

      if (isTabular) {
        processTabularFormat(lines, event)
      } else {
        processCSVFormat(lines, event)
      }
    }
    reader.onerror = () => {
      toast.error('Erro ao ler o arquivo')
      event.target.value = ''
    }
    reader.readAsText(file)
  }
}

const validateLeads = async () => {
  if (!form.value.leads || !Array.isArray(form.value.leads) || form.value.leads.length === 0) {
    toast.error('Nenhum lead para validar')
    return
  }

  const validatedLeads = await validateLeadsList(form.value.leads)

  if (validatedLeads && validatedLeads.length > 0) {
    form.value.leads = validatedLeads
    form.value.validated = true
  } else {
    toast.warning('Nenhum lead foi validado com sucesso')
  }
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
      createdAt: new Date().toISOString(),
      company_id: isAdmin.value ? form.value.companyId : user.value.company_id
    }

    await saveValidationList(listData)
    showUploadModal.value = false
    resetForm()
  } catch (error) {
    console.error('Erro ao salvar lista:', error)
    toast.error('Erro ao salvar lista')
  } finally {
    isSubmitting.value = false
  }
}

const downloadTemplate = () => {
  try {
    // Criar cabeçalho do CSV
    const headers = ['nome', 'numero']
    const csvContent = [
      headers.join(','),
      'João Silva,5511999999999',
      'Maria Santos,5511988888888'
    ].join('\n')

    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'modelo_leads.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Erro ao gerar template CSV:', error)
    toast.error('Erro ao gerar arquivo de modelo')
  }
}

// Lifecycle
onMounted(async () => {
  console.log('LeadsView mounted. Initializing fetchValidationLists...');
  await fetchValidationLists();
  console.log('fetchValidationLists completed. Current filteredValidationLists:', filteredValidationLists.value);
  fetchCompanies();
})
</script>

<style scoped>
.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>