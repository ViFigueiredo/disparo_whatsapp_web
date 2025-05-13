<template>
  <div class="space-y-6 relative">
    <loading-overlay v-if="isLoading" message="Carregando conexões..." />

    <connections-header
      v-model:search="searchQuery"
      v-model:sort="sortOrder"
      v-model:status="statusFilter"
      @new-connection="openCreateConnectionModal"
      @refresh="refreshConnections"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="connection in filteredConnections" :key="connection.id" class="relative">
        <connection-card 
          :connection="connection" 
          :is-admin="isAdmin" 
          @edit="openEditConnectionModal"
          @view-details="showConnectionDetails" 
          @connection-updated="fetchConnections" 
        />
      </div>
    </div>

    <!-- Modal de Detalhes da Conexão -->
    <base-modal v-if="selectedConnection" v-model="showDetailsModal" title="Detalhes da Conexão">
      <connection-details 
        :connection="selectedConnection"
        :company-name="getCompanyNameForConnection(selectedConnection.id)"
      />
    </base-modal>

    <!-- Modal de Criação de Conexão -->
    <base-modal v-model="showCreateModal" title="Nova Conexão">
      <connection-form
        :is-admin="isAdmin"
        :companies="companiesStore.companies"
        :is-submitting="isCreating"
        submit-button-text="Criar Conexão"
        @submit="handleCreateConnection"
        @cancel="showCreateModal = false"
      />
    </base-modal>

    <!-- Modal de Edição de Conexão -->
    <base-modal v-model="showEditModal" title="Alterar Empresa da Conexão">
      <connection-form
        :connection="editConnection"
        :is-admin="isAdmin"
        :companies="companiesStore.companies"
        :is-submitting="isEditing"
        submit-button-text="Salvar"
        @submit="handleUpdateConnection"
        @cancel="showEditModal = false"
      />
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
const { 
  connections,
  isLoading,
  fetchConnections,
  createConnection,
  updateConnectionCompany,
  getCompanyNameForConnection
} = useConnections()

// State
const searchQuery = ref('')
const sortOrder = ref('asc')
const statusFilter = ref('')
const showDetailsModal = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedConnection = ref(null)
const isCreating = ref(false)
const isEditing = ref(false)
const editConnection = ref({
  id: '',
  name: '',
  phoneNumber: '',
  company_id: ''
})

// Computed
const isAdmin = computed(() => authStore.isAdmin)

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
    phoneNumber: connection.phoneNumber,
    company_id: connection.company_id || ''
  }
  if (isAdmin.value && companiesStore.companies.length === 0) {
    await companiesStore.fetchCompanies()
  }
  showEditModal.value = true
}

const handleCreateConnection = async (formData) => {
  isCreating.value = true
  const success = await createConnection(formData)
  if (success) {
    showCreateModal.value = false
  }
  isCreating.value = false
}

const handleUpdateConnection = async (formData) => {
  isEditing.value = true
  const success = await updateConnectionCompany(formData)
  if (success) {
    showEditModal.value = false
  }
  isEditing.value = false
}

const refreshConnections = () => {
  fetchConnections()
  toast.info('Atualizando lista de conexões...')
}

// Lifecycle
onMounted(() => {
  fetchConnections()
})
</script>