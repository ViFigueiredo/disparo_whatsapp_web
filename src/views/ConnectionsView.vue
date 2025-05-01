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
      <base-button @click="refreshConnections">
        <i class="fas fa-sync-alt mr-2"></i>
        Atualizar Conexões
      </base-button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <connection-card 
        v-for="connection in connections" 
        :key="connection.id" 
        :connection="connection"
        @view-details="showConnectionDetails"
      />
    </div>

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

onMounted(() => {
  fetchConnections()
})
</script>