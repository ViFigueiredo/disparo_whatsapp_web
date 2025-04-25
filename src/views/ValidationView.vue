<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Validação de Leads</h2>
      <base-button @click="openUploadModal">
        <i class="fas fa-upload mr-2"></i>
        Upload de Lista
      </base-button>
    </div>

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
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Nome da Lista -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Nome da Lista
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Digite o nome da lista"
          />
        </div>

        <!-- Upload CSV -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Arquivo CSV
          </label>
          <input
            type="file"
            accept=".csv"
            @change="handleFileUpload"
            required
            class="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <p class="mt-1 text-sm text-gray-500">
            O arquivo deve ser CSV com colunas: nome, numero
          </p>
        </div>

        <!-- Estatísticas de Validação -->
        <div v-if="form.validated" class="mt-4 bg-gray-50 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Resultado da Validação</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <p class="text-sm text-gray-500">Total de Números</p>
              <p class="text-2xl font-bold text-gray-900">{{ form.leads.length }}</p>
            </div>
            <div class="text-center">
              <p class="text-sm text-gray-500">Números Válidos</p>
              <p class="text-2xl font-bold text-green-600">{{ validNumbers }}</p>
            </div>
          </div>
          
          <!-- Botão de Download -->
          <div class="mt-4 flex justify-center">
            <button
              type="button"
              @click="downloadValidatedCSV(list.id)"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              <i class="fas fa-download mr-2"></i>
              Baixar CSV Validado
            </button>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="closeUploadModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="validateLeads"
            :disabled="!form.leads.length"
            class="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Validar Números
          </button>
          <button
            type="submit"
            :disabled="!form.leads.length || !form.validated"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar Lista
          </button>
        </div>
      </form>
    </base-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ValidationListItem from '@/components/validation/ValidationListItem.vue'
import { webhooks } from '@/config/webhooks'

const toast = useToast()
const showUploadModal = ref(false)
const validationLists = ref([])
const form = ref({
  name: '',
  leads: [], // Initialize leads as an empty array
  validated: false
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      // Remove possíveis caracteres BOM e espaços extras
      const cleanText = text.replace(/^\uFEFF/, '').trim()
      const lines = cleanText.split(/\r?\n/)
      
      // Normalização mais flexível do cabeçalho
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
          
          // Processa o número, lidando com notação científica e números normais
          let numero = values[numeroIndex] || ''
          if (numero) {
            try {
              // Remove caracteres não numéricos mantendo E, e, +, - e ponto
              numero = numero.replace(/[^\d.Ee+-]/g, '')
              
              // Verifica se é notação científica
              if (numero.includes('E') || numero.includes('e')) {
                const numberValue = Number(numero)
                if (!isNaN(numberValue)) {
                  numero = Math.round(numberValue).toString()
                }
              } else {
                // Remove todos os caracteres não numéricos para números normais
                numero = numero.replace(/[^\d]/g, '')
              }
            } catch (error) {
              console.error('Erro ao processar número:', error)
              numero = numero.replace(/[^\d]/g, '')
            }
          }

          return {
            nome: values[nomeIndex] || '',
            numero: numero
          }
        })
        .filter(lead => {
          const isValid = lead.nome && lead.numero && lead.numero.length >= 10
          if (!isValid) {
            console.warn('Lead inválido encontrado:', lead)
          }
          return isValid
        })

      if (form.value.leads.length > 0) {
        toast.success(`${form.value.leads.length} leads carregados com sucesso!`)
      } else {
        toast.warning('Nenhum lead válido encontrado no arquivo')
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  }
}

// Adicione esta computed property para calcular os números válidos
const validNumbers = computed(() => {
  return form.value.leads.filter(lead => lead.exists).length
})

const validateLeads = async () => {
  if (!form.value.leads || !Array.isArray(form.value.leads)) {
    toast.error('Nenhum lead para validar')
    return
  }

  try {
    const response = await fetch(webhooks.validation.validate, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        leads: form.value.leads
      })
    })

    if (!response.ok) {
      throw new Error('Erro ao validar números')
    }

    const data = await response.json()
    
    // Processa o novo formato de resposta
    const validatedLeads = data.map(result => {
      if (result.success && result.data && result.data.length > 0) {
        const validationData = result.data[0]
        return {
          nome: form.value.leads.find(l => l.numero === validationData.number)?.nome || '',
          numero: validationData.number,
          exists: validationData.exists,
          jid: validationData.jid
        }
      }
      return null
    }).filter(lead => lead !== null)

    form.value.leads = validatedLeads
    form.value.validated = true
    
    // Atualiza a mensagem de sucesso com as estatísticas
    const totalValid = validatedLeads.filter(lead => lead.exists).length
    toast.success(`Validação concluída: ${totalValid} de ${validatedLeads.length} números são válidos`)
  } catch (error) {
    console.error('Erro na validação:', error)
    toast.error('Erro ao validar números')
  }
}

const handleSubmit = async () => {
  try {
    const listData = {
      name: form.value.name,
      leads: form.value.leads,
      totalLeads: form.value.leads.length,
      validLeads: form.value.leads.filter(lead => lead.exists).length,
      invalidLeads: form.value.leads.filter(lead => !lead.exists).length,
      createdAt: new Date().toISOString()
    }

    const response = await fetch(webhooks.validation.save, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(listData)
    })

    if (!response.ok) {
      throw new Error('Erro ao salvar lista')
    }

    // Atualiza a lista de validações
    await fetchValidationLists()
    showUploadModal.value = false
    resetForm()
    toast.success('Lista salva com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar lista:', error)
    toast.error('Erro ao salvar lista')
  }
}

const handleListDeleted = (listId) => {
  validationLists.value = validationLists.value.filter(list => list.id !== listId)
}

const fetchValidationLists = async () => {
  try {
    const response = await fetch(webhooks.validation.list)    
    
    // Verifica o content-type da resposta
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('O servidor retornou um formato inválido. Esperado: JSON')
    }

    if (!response.ok) {
      throw new Error(`Erro ao carregar listas: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Extrai as listas do segundo objeto do array que contém a chave "lists"
    const lists = data[1]?.lists || []
    validationLists.value = lists
    
  } catch (error) {
    console.error('Erro ao carregar listas:', error)
    toast.error(`Erro ao carregar listas: ${error.message}`)
    validationLists.value = []
  }
}

// Adicione a chamada ao fetchValidationLists no onMounted
onMounted(() => {
  fetchValidationLists()
})

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

const downloadValidatedCSV = async (listId) => {
  try {
    const response = await fetch(webhooks.validation.list)
    const data = await response.json()
    
    // Pega os leads do primeiro objeto do array
    const allLeads = data[0]?.leads || []
    
    // Filtra os leads pela lista específica
    const listLeads = allLeads.filter(lead => lead.list_id === listId)

    if (listLeads.length === 0) {
      toast.warning('Nenhum lead encontrado para esta lista')
      return
    }

    // Prepara os dados para o CSV com BOM para UTF-8
    const BOM = '\uFEFF'
    const csvContent = BOM + [
      // Cabeçalho
      ['nome', 'numero', 'status'].join(','),
      // Dados
      ...listLeads.map(lead => [
        lead.nome.split(';')[0], // Remove o número do nome
        lead.numero.replace(/^e/, ''), // Remove o 'e' do início do número se existir
        lead.exists ? 'Válido' : 'Inválido'
      ].join(','))
    ].join('\n')

    // Cria o blob especificando UTF-8
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8'
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `lista_validada_${listId}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Download iniciado com sucesso!')
  } catch (error) {
    console.error('Erro ao gerar CSV:', error)
    toast.error('Erro ao gerar arquivo CSV')
  }
}
</script>

<style scoped></style>