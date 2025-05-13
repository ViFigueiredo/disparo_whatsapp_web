<template>
  <div class="space-y-6 relative">
    <!-- Overlay de Loading -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div class="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
        <p class="text-gray-700">Carregando conexões...</p>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Conexões de WhatsApp</h2>
      <ListFilterSort v-model:search="searchQuery" v-model:sort="sortOrder" search-placeholder="Buscar por nome...">
        <select v-model="statusFilter"
          class="py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-2">
          <option value="">Todas</option>
          <option value="open">Conectado</option>
          <option value="disconnected">Desconectado</option>
        </select>
        <base-button @click="openCreateConnectionModal">
          <i class="fas fa-plus mr-2"></i>
          Nova Conexão
        </base-button>
        <base-button @click="refreshConnections">
          <i class="fas fa-sync-alt mr-2"></i>
          Atualizar Conexões
        </base-button>
      </ListFilterSort>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="connection in filteredConnections" :key="connection.id" class="relative">
        <connection-card :connection="connection" :is-admin="isAdmin" @edit="openEditConnectionModal"
          @view-details="showConnectionDetails" @connection-updated="fetchConnections" />
      </div>
    </div>

    <!-- Modal de Detalhes da Conexão -->
    <base-modal v-if="selectedConnection" v-model="showDetailsModal" title="Detalhes da Conexão">
      <div class="bg-white p-4 rounded-lg">
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-full overflow-hidden">
              <img v-if="selectedConnection.profilePicUrl" :src="selectedConnection.profilePicUrl" alt="Foto de perfil"
                class="w-full h-full object-cover" @error="handleImageError" />
              <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
                <i class="fas fa-user text-gray-400 text-2xl"></i>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold">{{ selectedConnection.profileName || selectedConnection.name }}</h3>
              <p class="text-sm text-gray-500">{{ selectedConnection.ownerJid }}</p>
              <div class="flex items-center mt-1">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                  selectedConnection.connectionStatus === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ selectedConnection.connectionStatus === 'open' ? 'Conectado' : 'Desconectado' }}
                </span>
              </div>
            </div>
          </div>

          <div class="border-t pt-4">
            <h4 class="font-medium mb-2">Informações da Conexão</h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-500">ID:</span>
                <p class="font-mono text-xs break-all">{{ selectedConnection.id }}</p>
              </div>
              <div>
                <span class="text-gray-500">Nome:</span>
                <p>{{ selectedConnection.name }}</p>
              </div>
              <div>
                <span class="text-gray-500">Integração:</span>
                <p>{{ selectedConnection.integration }}</p>
              </div>
              <div>
                <span class="text-gray-500">Cliente:</span>
                <p>{{ selectedConnection.clientName }}</p>
              </div>
              <div>
                <span class="text-gray-500">Empresa:</span>
                <p>{{ selectedCompanyName }}</p>
              </div>
              <div>
                <span class="text-gray-500">Criado em:</span>
                <p>{{ formatDate(selectedConnection.createdAt) }}</p>
              </div>
              <div>
                <span class="text-gray-500">Atualizado em:</span>
                <p>{{ formatDate(selectedConnection.updatedAt) }}</p>
              </div>
            </div>
          </div>

          <div v-if="selectedConnection.Chatwoot" class="border-t pt-4">
            <h4 class="font-medium mb-2">Integração Chatwoot</h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-500">Status:</span>
                <p>{{ selectedConnection.Chatwoot.enabled ? 'Ativado' : 'Desativado' }}</p>
              </div>
              <div>
                <span class="text-gray-500">ID da Conta:</span>
                <p>{{ selectedConnection.Chatwoot.accountId }}</p>
              </div>
              <div>
                <span class="text-gray-500">Nome da Caixa:</span>
                <p>{{ selectedConnection.Chatwoot.nameInbox }}</p>
              </div>
              <div>
                <span class="text-gray-500">URL:</span>
                <p class="truncate">{{ selectedConnection.Chatwoot.url }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </base-modal>

    <!-- Modal de Criação de Conexão -->
    <base-modal v-model="showCreateModal" title="Nova Conexão">
      <form @submit.prevent="createConnection" class="space-y-4">
        <!-- Nome da Conexão -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Nome da Conexão
          </label>
          <input v-model="newConnection.name" type="text" required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Digite o nome da conexão" />
        </div>

        <!-- Número do WhatsApp -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Número do WhatsApp
          </label>
          <input v-model="newConnection.phoneNumber" type="text" required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ex: 5511999999999 (com código do país)" />
        </div>

        <!-- Empresa (apenas para admin) -->
        <div v-if="isAdmin">
          <label class="block text-sm font-medium text-gray-700">
            Empresa
          </label>
          <select v-model="newConnection.company_id" required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="" disabled>Selecione a empresa</option>
            <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>

        <!-- Botões -->
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" @click="showCreateModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            :disabled="isCreating">
            <i v-if="isCreating" class="fas fa-spinner fa-spin mr-2"></i>
            {{ isCreating ? 'Criando...' : 'Criar Conexão' }}
          </button>
        </div>
      </form>
    </base-modal>

    <!-- Modal de Edição de Conexão (apenas empresa) -->
    <base-modal v-model="showEditModal" title="Alterar Empresa da Conexão">
      <form @submit.prevent="updateConnectionCompany" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Empresa
          </label>
          <select v-model="editConnection.company_id" required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="" disabled>Selecione a empresa</option>
            <option v-for="company in companiesStore.companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" @click="showEditModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            :disabled="isEditing">
            <i v-if="isEditing" class="fas fa-spinner fa-spin mr-2"></i>
            {{ isEditing ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </base-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import BaseButton from '../components/common/BaseButton.vue'
import BaseModal from '../components/common/BaseModal.vue'
import ConnectionCard from '../components/connections/ConnectionCard.vue'
import ListFilterSort from '../components/common/ListFilterSort.vue'
import { useConnectionStore } from '../stores/connection'
import { useCompaniesStore } from '../stores/companies'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const toast = useToast()
const connectionStore = useConnectionStore()
const companiesStore = useCompaniesStore()
const authStore = useAuthStore()
const connections = ref([])
const isLoading = ref(false)
const showDetailsModal = ref(false)
const selectedConnection = ref(null)
const searchQuery = ref('')
const sortOrder = ref('asc')
const statusFilter = ref('')

// Estado para o modal de criação
const showCreateModal = ref(false)
const isCreating = ref(false)
const newConnection = ref({
  name: '',
  phoneNumber: '',
  company_id: ''
})

// Estado para o modal de edição
const showEditModal = ref(false)
const isEditing = ref(false)
const editConnection = ref({
  id: '',
  name: '',
  phoneNumber: '',
  company_id: ''
})

const isAdmin = computed(() => authStore.isAdmin)

// Computed property para filtrar e ordenar conexões
const filteredConnections = computed(() => {
  let result = connections.value

  // Filtro de status
  if (statusFilter.value) {
    if (statusFilter.value === 'open') {
      result = result.filter(connection => connection.connectionStatus === 'open')
    } else if (statusFilter.value === 'disconnected') {
      result = result.filter(connection => connection.connectionStatus !== 'open')
    }
  }

  // Filtro de busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(connection =>
      connection.name.toLowerCase().includes(query) ||
      connection.profileName?.toLowerCase().includes(query)
    )
  }

  // Ordenação
  return result.sort((a, b) => {
    const nameA = (a.name || '').toLowerCase()
    const nameB = (b.name || '').toLowerCase()
    if (sortOrder.value === 'asc') {
      return nameA.localeCompare(nameB)
    } else {
      return nameB.localeCompare(nameA)
    }
  })
})

// Formatar data para exibição
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Lidar com erro de carregamento de imagem
const handleImageError = (event) => {
  event.target.src = ''
  event.target.classList.add('hidden')
  event.target.nextElementSibling?.classList.remove('hidden')
}

const companyConnections = ref([])

const fetchCompanyConnections = async () => {
  try {
    const response = await axios.get(import.meta.env.VITE_WEBHOOK_COMPANIES_CONNECTIONS_LIST)
    companyConnections.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    companyConnections.value = []
  }
}

const fetchConnections = async () => {
  try {
    isLoading.value = true
    await companiesStore.fetchCompanies()
    await connectionStore.fetchConnections()
    connections.value = connectionStore.connections
    await fetchCompanyConnections()
  } catch (error) {
    console.error('Erro ao carregar conexões:', error)
    toast.error('Erro ao carregar conexões')
  } finally {
    isLoading.value = false
  }
}

// Mostrar detalhes da conexão
const showConnectionDetails = (connection) => {
  selectedConnection.value = connection
  showDetailsModal.value = true
}

// Abrir modal de criação de conexão
const openCreateConnectionModal = async () => {
  newConnection.value = {
    name: '',
    phoneNumber: '',
    company_id: ''
  }
  showCreateModal.value = true
  if (isAdmin.value && companiesStore.companies.length === 0) {
    await companiesStore.fetchCompanies()
  }
}

// Abrir modal de edição de conexão
const openEditConnectionModal = async (connection) => {
  editConnection.value = {
    id: connection.id,
    name: connection.name,
    phoneNumber: connection.phoneNumber,
    company_id: connection.company_id || ''
  }
  showEditModal.value = true
  if (isAdmin.value && companiesStore.companies.length === 0) {
    await companiesStore.fetchCompanies()
  }
}

// Criar nova conexão
const createConnection = async () => {
  try {
    isCreating.value = true
    // 1. Criar conexão na Evolution API
    const evolutionResponse = await axios.post(import.meta.env.VITE_WEBHOOK_CONNECTIONS_CREATE, {
      name: newConnection.value.name,
      phoneNumber: newConnection.value.phoneNumber
    })
    const connectionId = evolutionResponse.data.id || evolutionResponse.data.connection_id || evolutionResponse.data.connectionId
    if (!connectionId) throw new Error('ID da conexão não retornado pela Evolution API')

    // 2. Relacionar conexão à empresa no banco local
    await axios.post(import.meta.env.VITE_WEBHOOK_COMPANIES_CONNECTIONS_CREATE, {
      company_id: newConnection.value.company_id,
      connection_id: connectionId
    })

    showCreateModal.value = false
    toast.success('Conexão criada e vinculada à empresa com sucesso!')
    fetchConnections()
  } catch (error) {
    console.error('Erro ao criar conexão:', error)
    toast.error('Erro ao criar conexão: ' + (error.message || 'Erro desconhecido'))
  } finally {
    isCreating.value = false
  }
}

// Atualizar conexão
const updateConnectionCompany = async () => {
  try {
    isEditing.value = true
    // Atualizar apenas o relacionamento empresa-conexão
    await axios.post(import.meta.env.VITE_WEBHOOK_COMPANIES_CONNECTIONS_UPDATE, {
      company_id: editConnection.value.company_id,
      connection_id: editConnection.value.id
    })
    showEditModal.value = false
    toast.success('Empresa da conexão atualizada com sucesso!')
    fetchConnections()
  } catch (error) {
    console.error('Erro ao atualizar empresa da conexão:', error)
    toast.error('Erro ao atualizar empresa da conexão: ' + (error.message || 'Erro desconhecido'))
  } finally {
    isEditing.value = false
  }
}

const selectedCompanyName = computed(() => {
  if (!selectedConnection.value) return 'N/A'
  console.log('selectedConnection.value.id:', selectedConnection.value.id)
  console.log('companyConnections.value:', companyConnections.value)
  const rel = companyConnections.value.find(
    c => String(c.connection_id).trim() === String(selectedConnection.value.id).trim()
  )
  console.log('Relacionamento encontrado:', rel)
  console.log('companiesStore.companies:', companiesStore.companies)
  if (!rel) return 'N/A'
  const company = companiesStore.companies.find(
    c => String(c.id) === String(rel.company_id)
  )
  console.log('Empresa encontrada:', company)
  return company ? company.name : 'N/A'
})

const refreshConnections = () => {
  fetchConnections()
  toast.info('Atualizando lista de conexões...')
}

onMounted(() => {
  fetchConnections()
})
</script>