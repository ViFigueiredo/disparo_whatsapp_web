<template>
  <div class="bg-white p-4 rounded-lg">
    <div class="space-y-4">
      <!-- Profile Section -->
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 rounded-full overflow-hidden">
          <img 
            v-if="connection.profilePicUrl" 
            :src="connection.profilePicUrl" 
            alt="Foto de perfil"
            class="w-full h-full object-cover" 
            @error="handleImageError" 
          />
          <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
            <i class="fas fa-user text-gray-400 text-2xl"></i>
          </div>
        </div>
        <div>
          <h3 class="text-lg font-semibold">{{ connection.profileName || connection.name }}</h3>
          <p class="text-sm text-gray-500">{{ connection.ownerJid }}</p>
          <div class="flex items-center mt-1">
            <span :class="[
              'inline-flex px-2 py-1 text-xs font-medium rounded-full',
              connection.connectionStatus === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            ]">
              {{ connection.connectionStatus === 'open' ? 'Conectado' : 'Desconectado' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Connection Info Section -->
      <div class="border-t pt-4">
        <h4 class="font-medium mb-2">Informações da Conexão</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-500">ID:</span>
            <p class="font-mono text-xs break-all">{{ connection.id }}</p>
          </div>
          <div>
            <span class="text-gray-500">Nome:</span>
            <p>{{ connection.name }}</p>
          </div>
          <div>
            <span class="text-gray-500">Integração:</span>
            <p>{{ connection.integration }}</p>
          </div>
          <div>
            <span class="text-gray-500">Cliente:</span>
            <p>{{ connection.clientName }}</p>
          </div>
          <div>
            <span class="text-gray-500">Empresa:</span>
            <p>{{ companyName }}</p>
          </div>
          <div>
            <span class="text-gray-500">Criado em:</span>
            <p>{{ formatDate(connection.createdAt) }}</p>
          </div>
          <div>
            <span class="text-gray-500">Atualizado em:</span>
            <p>{{ formatDate(connection.updatedAt) }}</p>
          </div>
        </div>
      </div>

      <!-- Chatwoot Section -->
      <div v-if="connection.Chatwoot" class="border-t pt-4">
        <h4 class="font-medium mb-2">Integração Chatwoot</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-500">Status:</span>
            <p>{{ connection.Chatwoot.enabled ? 'Ativado' : 'Desativado' }}</p>
          </div>
          <div>
            <span class="text-gray-500">ID da Conta:</span>
            <p>{{ connection.Chatwoot.accountId }}</p>
          </div>
          <div>
            <span class="text-gray-500">Nome da Caixa:</span>
            <p>{{ connection.Chatwoot.nameInbox }}</p>
          </div>
          <div>
            <span class="text-gray-500">URL:</span>
            <p class="truncate">{{ connection.Chatwoot.url }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  connection: {
    type: Object,
    required: true
  },
  companyName: {
    type: String,
    default: 'N/A'
  }
})

const handleImageError = (event) => {
  event.target.src = ''
  event.target.classList.add('hidden')
  event.target.nextElementSibling?.classList.remove('hidden')
}

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
</script> 