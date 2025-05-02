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
      
      <!-- Botão de Conectar (exibido apenas quando desconectado) -->
      <div v-if="connection.connectionStatus !== 'open'" class="mt-3">
        <button 
          @click="openConnectModal" 
          class="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center justify-center"
        >
          <i class="fas fa-plug mr-2"></i>
          Conectar
        </button>
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
  
  <!-- Modal de Conexão -->
  <base-modal v-model="showConnectModal" title="Conectar WhatsApp">
    <div class="p-4 space-y-4">
      <div v-if="connectStep === 'initial'" class="text-center">
        <p class="mb-4">Iniciando conexão para <strong>{{ connection.name }}</strong>...</p>
        <div class="flex justify-center">
          <i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
        </div>
      </div>
      
      <div v-else-if="connectStep === 'qrcode'" class="text-center">
        <p class="mb-4">Escaneie o QR Code com seu WhatsApp:</p>
        <div class="flex justify-center mb-4">
          <img :src="qrCodeImage" alt="QR Code" class="w-64 h-64" />
        </div>
        <p class="text-sm text-gray-500">
          Abra o WhatsApp no seu celular > Menu > WhatsApp Web > Escanear código QR
        </p>
      </div>
      
      <div v-else-if="connectStep === 'pairingCode'" class="text-center">
        <p class="mb-4">Digite o código de pareamento no seu WhatsApp:</p>
        <div class="flex justify-center mb-4">
          <div class="text-3xl font-bold tracking-widest bg-gray-100 p-4 rounded-lg">
            {{ pairingCode }}
          </div>
        </div>
        <p class="text-sm text-gray-500">
          Abra o WhatsApp no seu celular > Menu > Dispositivos vinculados > Vincular dispositivo
        </p>
      </div>
      
      <div v-else-if="connectStep === 'success'" class="text-center">
        <div class="mb-4 flex justify-center">
          <i class="fas fa-check-circle text-5xl text-green-500"></i>
        </div>
        <p class="text-lg font-medium text-green-700">Conexão estabelecida com sucesso!</p>
        <p class="mt-2">O WhatsApp foi conectado e está pronto para uso.</p>
      </div>
      
      <div v-else-if="connectStep === 'error'" class="text-center">
        <div class="mb-4 flex justify-center">
          <i class="fas fa-times-circle text-5xl text-red-500"></i>
        </div>
        <p class="text-lg font-medium text-red-700">Erro ao conectar</p>
        <p class="mt-2">{{ errorMessage }}</p>
      </div>
      
      <div class="flex justify-end mt-6">
        <button 
          v-if="connectStep === 'error' || connectStep === 'success'"
          @click="showConnectModal = false"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Fechar
        </button>
        <button 
          v-if="connectStep === 'qrcode' || connectStep === 'pairingCode'"
          @click="cancelConnection"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 mr-2"
        >
          Cancelar
        </button>
      </div>
    </div>
  </base-modal>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import BaseModal from '../common/BaseModal.vue'
import { useConnectionStore } from '../../stores/connection'

const toast = useToast()
const connectionStore = useConnectionStore()
const showConnectModal = ref(false)
const connectStep = ref('initial')
const qrCodeImage = ref('')
const pairingCode = ref('')
const errorMessage = ref('')
const connectionInterval = ref(null)

const emit = defineEmits(['view-details', 'connection-updated'])

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

// Abrir modal de conexão
const openConnectModal = async () => {
  showConnectModal.value = true
  connectStep.value = 'initial'
  errorMessage.value = ''
  
  try {
    // Iniciar processo de conexão
    const response = await connectionStore.connectInstance(props.connection.name)
    
    if (response && Array.isArray(response) && response.length > 0 && response[0].success) {
      const data = response[0].data
      
      if (data.base64) {
        // Se retornou QR code, mostrar para o usuário escanear
        // Verificar se o base64 já inclui o prefixo data:image
        qrCodeImage.value = data.base64.startsWith('data:image') 
          ? data.base64 
          : `data:image/png;base64,${data.base64}`
        connectStep.value = 'qrcode'
      } else if (data.pairingCode) {
        // Se retornou código de pareamento, mostrar para o usuário
        pairingCode.value = data.pairingCode
        connectStep.value = 'pairingCode'
      } else {
        // Se não retornou nem QR code nem código de pareamento, mostrar erro
        connectStep.value = 'error'
        errorMessage.value = 'Não foi possível obter o QR code ou código de pareamento'
      }
      
      // Iniciar polling para verificar status da conexão
      startConnectionPolling()
    } else {
      // Se houve algum erro
      connectStep.value = 'error'
      errorMessage.value = 'Erro desconhecido ao conectar'
    }
  } catch (error) {
    console.error('Erro ao iniciar conexão:', error)
    connectStep.value = 'error'
    errorMessage.value = error.message || 'Erro desconhecido ao iniciar conexão'
  }
}

// Iniciar polling para verificar status da conexão
const startConnectionPolling = () => {
  // Limpar intervalo anterior se existir
  if (connectionInterval.value) {
    clearInterval(connectionInterval.value)
  }
  
  let attempts = 0;
  const maxAttempts = 3; // Número máximo de tentativas de QR code
  
  // Verificar status a cada 40 segundos
  connectionInterval.value = setInterval(async () => {
    try {
      const status = await connectionStore.checkConnectionStatus(props.connection.name);
      
      if (status.connected) {
        // Se conectado com sucesso
        clearInterval(connectionInterval.value)
        connectStep.value = 'success'
        emit('connection-updated')
      } else if (status.error) {
        // Se ocorreu um erro
        clearInterval(connectionInterval.value)
        connectStep.value = 'error'
        errorMessage.value = status.message || 'Erro ao estabelecer conexão'
      } else {
        // Se ainda estiver aguardando e não estiver conectado após 40s
        attempts++;
        
        if (attempts >= maxAttempts) {
          // Se atingiu o número máximo de tentativas, mostrar erro
          clearInterval(connectionInterval.value)
          connectStep.value = 'error'
          errorMessage.value = 'Tempo limite excedido. Por favor, tente novamente.'
        } else {
          // Gerar um novo QR code
          try {
            console.log(`Tentativa ${attempts + 1}: Gerando novo QR code...`);
            const response = await connectionStore.connectInstance(props.connection.name);
            
            if (response && Array.isArray(response) && response.length > 0 && response[0].success) {
              const data = response[0].data;
              
              if (data.base64) {
                // Se retornou QR code, mostrar para o usuário escanear
                qrCodeImage.value = data.base64.startsWith('data:image') 
                  ? data.base64 
                  : `data:image/png;base64,${data.base64}`;
                connectStep.value = 'qrcode';
                toast.info(`QR code atualizado. Tentativa ${attempts + 1} de ${maxAttempts}`);
              } else if (data.pairingCode) {
                // Se retornou código de pareamento, mostrar para o usuário
                pairingCode.value = data.pairingCode;
                connectStep.value = 'pairingCode';
                toast.info(`Código de pareamento atualizado. Tentativa ${attempts + 1} de ${maxAttempts}`);
              }
            } else {
              throw new Error('Formato de resposta inválido');
            }
          } catch (error) {
            console.error('Erro ao gerar novo QR code:', error);
            // Continuar tentando na próxima iteração
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error);
      attempts++;
      
      if (attempts >= maxAttempts) {
        clearInterval(connectionInterval.value);
        connectStep.value = 'error';
        errorMessage.value = 'Erro ao verificar status da conexão após várias tentativas.';
      }
    }
  }, 5000);
}

// Cancelar conexão
const cancelConnection = async () => {
  try {
    // Mostrar estado de carregamento
    connectStep.value = 'initial'
    
    // Limpar intervalo de polling
    if (connectionInterval.value) {
      clearInterval(connectionInterval.value)
      connectionInterval.value = null
    }
    
    // Chamar API para cancelar conexão
    await connectionStore.cancelConnection(props.connection.name)
    
    // Fechar modal
    showConnectModal.value = false
    toast.info('Conexão cancelada com sucesso')
  } catch (error) {
    console.error('Erro ao cancelar conexão:', error)
    toast.error('Erro ao cancelar conexão: ' + (error.message || 'Erro desconhecido'))
    
    // Fechar modal mesmo em caso de erro
    showConnectModal.value = false
  }
}

// Limpar intervalo quando o componente for desmontado
onUnmounted(() => {
  if (connectionInterval.value) {
    clearInterval(connectionInterval.value)
  }
})
</script>