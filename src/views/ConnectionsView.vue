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
      <div class="flex space-x-3">
        <base-button @click="openCreateConnectionModal">
          <i class="fas fa-plus mr-2"></i>
          Nova Conexão
        </base-button>
        <base-button @click="refreshConnections">
          <i class="fas fa-sync-alt mr-2"></i>
          Atualizar Conexões
        </base-button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <connection-card 
        v-for="connection in connections" 
        :key="connection.id" 
        :connection="connection"
        @view-details="showConnectionDetails"
        @connection-updated="fetchConnections"
      />
    </div>

    <!-- Modal de Detalhes da Conexão -->
    <base-modal v-if="selectedConnection" v-model="showDetailsModal" title="Detalhes da Conexão">
      <div class="bg-white p-4 rounded-lg">
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 rounded-full overflow-hidden">
              <img 
                v-if="selectedConnection.profilePicUrl" 
                :src="selectedConnection.profilePicUrl" 
                alt="Foto de perfil"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
                <i class="fas fa-user text-gray-400 text-2xl"></i>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold">{{ selectedConnection.profileName || selectedConnection.name }}</h3>
              <p class="text-sm text-gray-500">{{ selectedConnection.ownerJid }}</p>
              <div class="flex items-center mt-1">
                <span 
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-medium rounded-full', 
                    selectedConnection.connectionStatus === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
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
          <input
            v-model="newConnection.name"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Digite o nome da conexão"
          />
        </div>

        <!-- Número do WhatsApp -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Número do WhatsApp
          </label>
          <input
            v-model="newConnection.phoneNumber"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Ex: 5511999999999 (com código do país)"
          />
        </div>

        <!-- Botões -->
        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="showCreateModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            :disabled="isCreating"
          >
            <i v-if="isCreating" class="fas fa-spinner fa-spin mr-2"></i>
            {{ isCreating ? 'Criando...' : 'Criar Conexão' }}
          </button>
        </div>
      </form>
    </base-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import BaseButton from '../components/common/BaseButton.vue'
import BaseModal from '../components/common/BaseModal.vue'
import ConnectionCard from '../components/connections/ConnectionCard.vue'
import { useConnectionStore } from '../stores/connection'

const toast = useToast()
const connectionStore = useConnectionStore()
const connections = ref([])
const isLoading = ref(false)
const showDetailsModal = ref(false)
const selectedConnection = ref(null)

// Estado para o modal de criação
const showCreateModal = ref(false)
const isCreating = ref(false)
const newConnection = ref({
  name: '',
  phoneNumber: ''
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

// Buscar conexões
const fetchConnections = async () => {
  try {
    isLoading.value = true
    await connectionStore.fetchConnections()
    connections.value = connectionStore.connections
  } catch (error) {
    console.error('Erro ao carregar conexões:', error)
    toast.error('Erro ao carregar conexões')
  } finally {
    isLoading.value = false
  }
}

// Atualizar conexões
const refreshConnections = () => {
  fetchConnections()
  toast.info('Atualizando lista de conexões...')
}

// Mostrar detalhes da conexão
const showConnectionDetails = (connection) => {
  selectedConnection.value = connection
  showDetailsModal.value = true
}

// Abrir modal de criação de conexão
const openCreateConnectionModal = () => {
  // Resetar o formulário
  newConnection.value = {
    name: '',
    phoneNumber: ''
  }
  showCreateModal.value = true
}

// Criar nova conexão
const createConnection = async () => {
  try {
    isCreating.value = true
    
    // Preparar dados para envio
    const connectionData = {
      name: newConnection.value.name,
      phoneNumber: newConnection.value.phoneNumber
    }
    
    // Enviar para o webhook
    await connectionStore.createConnection(connectionData)
    
    // Fechar modal e atualizar lista
    showCreateModal.value = false
    toast.success('Conexão criada com sucesso!')
    fetchConnections()
  } catch (error) {
    console.error('Erro ao criar conexão:', error)
    toast.error('Erro ao criar conexão: ' + (error.message || 'Erro desconhecido'))
  } finally {
    isCreating.value = false
  }
}

onMounted(() => {
  fetchConnections()
})
</script>