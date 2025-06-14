<template>
  <div class="space-y-6 relative">
    <loading-overlay v-if="isLoading" message="Carregando conexões..." />

    <connections-header v-model:search="searchQuery" v-model:sort="sortOrder" v-model:status="statusFilter"
      :companies="companiesStore.companies" v-model:company="companyFilter" :connections="filteredConnections"
      @new-connection="openCreateConnectionModal" @refresh="refreshConnections" />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="connection in connectionsWithCompanies" :key="connection.id" class="relative">
        <connection-card :connection="connection" :is-admin="isAdmin" @edit="openEditConnectionModal"
          @view-details="showConnectionDetails" @connection-updated="fetchConnections" />
      </div>
    </div>

    <!-- Modal de Detalhes da Conexão -->
    <base-modal v-if="selectedConnection" v-model="showDetailsModal" title="Detalhes da Conexão">
      <connection-details :connection="selectedConnection"
        :company-name="getCompanyNameForConnection(selectedConnection)" />
    </base-modal>

    <!-- Modal de Criação de Conexão -->
    <base-modal v-model="showCreateModal" title="Nova Conexão">
      <connection-form :is-admin="isAdmin" :companies="companiesStore.companies" :is-submitting="isCreating"
        submit-button-text="Criar Conexão" @submit="handleCreateConnection" @cancel="showCreateModal = false" />
    </base-modal>

    <!-- Modal de Edição de Conexão -->
    <base-modal v-model="showEditModal" title="Alterar Empresa da Conexão">
      <connection-form :connection="editConnection" :is-admin="isAdmin" :companies="companiesStore.companies"
        :is-submitting="isEditing" submit-button-text="Salvar" @submit="handleUpdateConnection"
        @cancel="showEditModal = false" />
    </base-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'
import { useCompaniesStore } from '../stores/companies'
import { useConnections } from '../composables/useConnections'

// Components
import BaseModal from '../components/common/BaseModal.vue'
import ConnectionCard from '../components/connections/ConnectionCard.vue'
import ConnectionsHeader from '../components/connections/ConnectionsHeader.vue'
import ConnectionDetails from '../components/connections/ConnectionDetails.vue'
import ConnectionForm from '../components/connections/ConnectionForm.vue'
import LoadingOverlay from '../components/common/LoadingOverlay.vue'

// Toast
const toast = useToast()

// Stores and composables
const authStore = useAuthStore()
const companiesStore = useCompaniesStore()
const useConnectionsResult = useConnections()

console.log('Resultado de useConnections():', useConnectionsResult)

const {
  connections,
  isLoading,
  fetchConnections,
  createConnection,
  updateConnectionCompany,
  getCompanyNameForConnection,
  connectionsWithCompanies
} = useConnectionsResult

// State
const searchQuery = ref('')
const sortOrder = ref('asc')
const statusFilter = ref('')
const companyFilter = ref('')
const showDetailsModal = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedConnection = ref(null)
const isCreating = ref(false)
const isEditing = ref(false)
const editConnection = ref({
  id: '',
  name: '',
  company_id: ''
})

// Computed
const isAdmin = computed(() => authStore.isAdmin)

const filteredConnections = computed(() => {
  // Garante que connectionsWithCompanies.value é um array antes de filtrar
  let result = (connectionsWithCompanies.value || []).filter(connection => 
    connection && Object.keys(connection).length > 0 && connection.name
  )

  // **FILTRO ADICIONAL: Restringir por empresa para usuários comuns**
  if (!isAdmin.value && authStore.user?.company_id) {
    result = result.filter(connection =>
      String(connection.companyId) === String(authStore.user.company_id)
    );
  }

  // Filtro de status
  if (statusFilter.value) {
    if (statusFilter.value === 'open') {
      result = result.filter(connection => connection.connectionStatus === 'open')
    } else if (statusFilter.value === 'disconnected') {
      result = result.filter(connection => connection.connectionStatus !== 'open')
    }
  }

  // Filtro de empresa
  if (companyFilter.value === 'none') {
    result = result.filter(connection => !connection.companyId)
  } else if (companyFilter.value) {
    result = result.filter(connection => String(connection.companyId) === String(companyFilter.value))
  }

  // Filtro de busca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(connection =>
      (connection.name || '').toLowerCase().includes(query) ||
      (connection.profileName || '').toLowerCase().includes(query) ||
      (connection.companyName || '').toLowerCase().includes(query)
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

// Methods
const showConnectionDetails = (connection) => {
  selectedConnection.value = connection
  showDetailsModal.value = true
}

const openCreateConnectionModal = async () => {
  if (isAdmin.value && companiesStore.companies.length === 0) {
    await companiesStore.fetchCompanies()
  }
  showCreateModal.value = true
}

const openEditConnectionModal = async (connection) => {
  editConnection.value = {
    id: connection.id,
    name: connection.name,
    company_id: connection.companyId || ''
  }
  if (isAdmin.value && companiesStore.companies.length === 0) {
    await companiesStore.fetchCompanies()
  }
  showEditModal.value = true
}

const handleCreateConnection = async (formData) => {
  isCreating.value = true
  try {
    const success = await createConnection(formData)
    if (success) {
      showCreateModal.value = false
    }
  } catch (error) {
    console.error('Erro ao criar conexão:', error)
    toast.error('Erro ao criar conexão')
  } finally {
    isCreating.value = false
  }
}

const handleUpdateConnection = async (formData) => {
  isEditing.value = true
  try {
    // Verifica se a empresa selecionada é igual à atual
    const currentConnection = connections.value.find(conn => conn.id === formData.id)
    if (currentConnection && String(currentConnection.companyId) === String(formData.company_id)) {
      showEditModal.value = false
      toast.success('Empresa da conexão atualizada com sucesso!')
      return
    }
    const success = await updateConnectionCompany(formData)
    if (success) {
      showEditModal.value = false
      toast.success('Empresa da conexão atualizada com sucesso!')
    }
  } catch (error) {
    console.error('Erro ao atualizar conexão:', error)
    toast.error('Erro ao atualizar conexão')
  } finally {
    isEditing.value = false
  }
}

const refreshConnections = async () => {
  try {
    await fetchConnections()
    toast.success('Lista de conexões atualizada!')
  } catch (error) {
    console.error('Erro ao atualizar conexões:', error)
    toast.error('Erro ao atualizar conexões')
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await fetchConnections()
  } catch (error) {
    console.error('Erro ao carregar conexões:', error)
    toast.error('Erro ao carregar conexões')
  }
})
</script>