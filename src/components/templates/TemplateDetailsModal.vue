<template>
  <base-modal 
    :model-value="show"
    @update:model-value="$emit('update:show')"
    title="Detalhes do Template"
  >
    <div v-if="template" class="space-y-6">
      <!-- Cabeçalho do Template -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ template.template_name }}
        </h3>
        <div class="flex items-center text-sm text-gray-500">
          <i class="fas fa-plug mr-2"></i>
          <span>{{ template.template_connection?.name || template.template_connection }}</span>
        </div>
      </div>

      <!-- Botão de Debug -->
      <div class="flex justify-end">
        <button 
          @click="toggleDebug" 
          class="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
        >
          <i class="fas fa-bug mr-1"></i>
          {{ showDebug ? 'Ocultar Debug' : 'Mostrar Debug' }}
        </button>
      </div>

      <!-- Template de Negócio - Apenas para WHATSAPP-BUSINESS -->
      <div v-if="isBusinessTemplate" class="space-y-4">
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Template de Negócio</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">Nome</span>
                <span class="font-medium">{{ template.business_template_name || 'hello_world' }}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">ID</span>
                <span class="font-medium">{{ template.business_template_id || '667287619582716' }}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">Categoria</span>
                <span class="font-medium">{{ template.business_template_category || 'UTILITY' }}</span>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">Idioma</span>
                <span class="font-medium">{{ template.business_template_language || 'en_US' }}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">Criado em</span>
                <span class="font-medium">{{ formatDate(template.created_at) }}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">Atualizado em</span>
                <span class="font-medium">{{ formatDate(template.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensagem e Respostas - Apenas para templates não-business -->
      <template v-if="!isBusinessTemplate">
        <div class="space-y-2">
          <h4 class="text-sm font-medium text-gray-700">Mensagem</h4>
          <div class="bg-white p-4 rounded-lg border border-gray-200">
            <p class="whitespace-pre-wrap">{{ template.template_message }}</p>
          </div>

          <!-- Slider de Respostas -->
          <div class="mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Mensagens Geradas pela IA</h4>
            <div class="relative">
              <div class="bg-white p-4 rounded-lg border border-gray-200">
                <p class="whitespace-pre-wrap">{{ currentResposta }}</p>
              </div>
              
              <!-- Controles do Slider -->
              <div class="flex justify-between items-center mt-4">
                <button 
                  @click="previousSlide"
                  class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  :disabled="currentIndex === 0"
                >
                  <i class="fas fa-chevron-left mr-1"></i>
                  Anterior
                </button>
                
                <span class="text-sm text-gray-500">
                  {{ currentIndex + 1 }} de 5
                </span>
                
                <button 
                  @click="nextSlide"
                  class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  :disabled="currentIndex === 4"
                >
                  Próxima
                  <i class="fas fa-chevron-right ml-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Lista de Validação -->
      <div v-if="template.template_list_id" class="space-y-2">
        <h4 class="text-sm font-medium text-gray-700">Lista de Validação</h4>
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-900">{{ template.template_list_name }}</span>
          </div>
        </div>
      </div>

      <!-- Seção de Debug Estilizada -->
      <div v-if="showDebug" class="space-y-4">
        <h4 class="text-sm font-medium text-gray-700">Informações de Debug</h4>
        
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">ID</span>
                <span class="font-medium">{{ template.id }}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">Nome do Template</span>
                <span class="font-medium">{{ template.template_name }}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">Conexão</span>
                <span class="font-medium">{{ template.template_connection }}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">ID da Lista</span>
                <span class="font-medium">{{ template.template_list_id }}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">Nome da Lista</span>
                <span class="font-medium">{{ template.template_list_name }}</span>
              </div>
            </div>
            
            <div class="space-y-3" v-if="isBusinessTemplate">
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">ID do Template de Negócio</span>
                <span class="font-medium">{{ template.business_template_id }}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">Nome do Template de Negócio</span>
                <span class="font-medium">{{ template.business_template_name }}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">Categoria do Template de Negócio</span>
                <span class="font-medium">{{ template.business_template_category }}</span>
              </div>
              
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">Idioma do Template de Negócio</span>
                <span class="font-medium">{{ template.business_template_language }}</span>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex flex-col">
              <span class="text-xs text-gray-500">Mensagem</span>
              <span class="font-medium whitespace-pre-wrap">{{ template.template_message || 'Sem mensagem' }}</span>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex flex-col">
              <span class="text-xs text-gray-500">JSON Completo</span>
              <pre class="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">{{ JSON.stringify(template, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="p-4 text-center text-gray-500">
      Nenhum dado do template disponível
    </div>

    <div class="mt-6 flex justify-end">
      <button
        @click="$emit('update:show', false)"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Fechar
      </button>
    </div>
  </base-modal>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue'
import BaseModal from '../common/BaseModal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  template: {
    type: Object,
    required: true
  }
})

// Adicionar estado para controlar a exibição do debug
const showDebug = ref(false)

// Função para alternar a exibição do debug
const toggleDebug = () => {
  showDebug.value = !showDebug.value
  
  // Log para debug no console
  if (showDebug.value) {
    console.log('Dados completos do template:', props.template)
    
    // Log específico para template de negócio
    if (isBusinessTemplate.value) {
      console.log('Template de negócio detectado')
      console.log('businessTemplate:', props.template.businessTemplate)
      console.log('business_template_id:', props.template.business_template_id)
      console.log('business_template_name:', props.template.business_template_name)
    }
  }
}

// Função para formatar datas
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    // Formato esperado: "2025-05-01T03:48:58.952Z"
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString; // Retorna a string original em caso de erro
  }
}

// Computed property para verificar se é um template de negócio
const isBusinessTemplate = computed(() => {
  if (!props.template) return false;
  
  // Verificar pelo tipo de integração
  if (props.template.integration_type === 'WHATSAPP-BUSINESS') return true;
  
  // Verificar pelo objeto connection
  if (props.template.template_connection && 
      typeof props.template.template_connection === 'object' && 
      props.template.template_connection.integration === 'WHATSAPP-BUSINESS') {
    return true;
  }
  
  // Verificar se tem businessTemplate definido
  return !!props.template.businessTemplate || !!props.template.business_template_id;
});

// Estado para o slider
const currentIndex = ref(0)

// Computed property para obter a resposta atual
const currentResposta = computed(() => {
  if (!props.template?.output) return ''
  const respostaKey = `Resposta${currentIndex.value + 1}`
  return props.template.output[respostaKey]
})

// Funções de controle do slider
const nextSlide = () => {
  if (currentIndex.value < 4) {
    currentIndex.value++
  }
}

const previousSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

defineEmits(['update:show'])

// Obter o nome do template de negócio
const getBusinessTemplateName = computed(() => {
  if (!props.template) return 'Não especificado';
  
  // Se businessTemplate for um objeto com propriedade name
  if (typeof props.template.businessTemplate === 'object' && props.template.businessTemplate?.name) {
    return props.template.businessTemplate.name;
  }
  
  // Se businessTemplate for uma string (ID), tentar encontrar o nome correspondente
  if (typeof props.template.businessTemplate === 'string') {
    // Se tivermos o nome do template em algum lugar, usá-lo
    if (props.template.business_template_name && 
        props.template.business_template_name !== props.template.businessTemplate) {
      return props.template.business_template_name;
    }
    
    // Caso contrário, usar o nome do template como fallback
    return props.template.template_name || 'Template de Negócio WhatsApp';
  }
  
  return props.template.business_template_name || 'Template de Negócio WhatsApp';
});

// Obter o idioma do template de negócio
const getBusinessTemplateLanguage = computed(() => {
  if (!props.template) return 'pt_BR';
  
  if (typeof props.template.businessTemplate === 'object' && props.template.businessTemplate?.language) {
    return props.template.businessTemplate.language;
  }
  
  return props.template.business_template_language || 'pt_BR';
});

// Obter a categoria do template de negócio
const getBusinessTemplateCategory = computed(() => {
  if (!props.template) return 'MARKETING';
  
  if (typeof props.template.businessTemplate === 'object' && props.template.businessTemplate?.category) {
    return props.template.businessTemplate.category;
  }
  
  return props.template.business_template_category || 'MARKETING';
});

// Obter o ID do template de negócio
const getBusinessTemplateId = computed(() => {
  if (!props.template) return '';
  
  if (typeof props.template.businessTemplate === 'object' && props.template.businessTemplate?.id) {
    return props.template.businessTemplate.id;
  }
  
  if (typeof props.template.businessTemplate === 'string') {
    return props.template.businessTemplate;
  }
  
  return props.template.business_template_id || '';
});
</script>