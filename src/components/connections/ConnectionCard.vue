<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div class="p-4">
      <div class="flex items-center space-x-3 mb-3">
        <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          <img 
            v-if="connection.profilePicUrl" 
            :src="connection.profilePicUrl" 
            alt="Foto de perfil"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <i class="fas fa-user text-gray-400"></i>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate">
            {{ connection.profileName || connection.name }}
          </h3>
          <p class="text-sm text-gray-500 truncate">{{ connection.ownerJid }}</p>
        </div>
        <div>
          <span 
            :class="[
              'inline-flex px-2 py-1 text-xs font-medium rounded-full', 
              connection.connectionStatus === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            ]"
          >
            {{ connection.connectionStatus === 'open' ? 'Conectado' : 'Desconectado' }}
          </span>
        </div>
      </div>
      
      <div class="text-sm text-gray-600 space-y-1">
        <div class="flex justify-between">
          <span class="text-gray-500">Integração:</span>
          <span class="font-medium">{{ connection.integration }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Cliente:</span>
          <span class="font-medium">{{ connection.clientName }}</span>
        </div>
        <div v-if="connection.Chatwoot" class="flex justify-between">
          <span class="text-gray-500">Chatwoot:</span>
          <span class="font-medium">{{ connection.Chatwoot.enabled ? 'Ativado' : 'Desativado' }}</span>
        </div>
      </div>
    </div>
    
    <div class="bg-gray-50 px-4 py-3 border-t border-gray-200">
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-500">
          Atualizado: {{ formatDate(connection.updatedAt) }}
        </span>
        <button 
          @click="$emit('view-details', connection)" 
          class="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <i class="fas fa-info-circle mr-1"></i>
          Detalhes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineEmits(['view-details'])

const props = defineProps({
  connection: {
    type: Object,
    required: true
  }
})

// Formatar data para exibição
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Lidar com erro de carregamento de imagem
const handleImageError = (event) => {
  event.target.src = ''
  event.target.classList.add('hidden')
  event.target.nextElementSibling?.classList.remove('hidden')
}
</script>