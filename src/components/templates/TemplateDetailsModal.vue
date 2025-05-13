<template>
  <base-modal 
    :model-value="show"
    @update:model-value="$emit('update:show')"
    title="Detalhes do Template"
  >
    <div v-if="template" class="space-y-6">
      <!-- Informações Básicas -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-4">Informações do Template</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm font-medium text-gray-500">Nome</p>
            <p class="mt-1">{{ template.template_name }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Conexão</p>
            <p class="mt-1">{{ template.template_connection }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Lista</p>
            <p class="mt-1">{{ template.template_list_name }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Status</p>
            <p class="mt-1">
              <span :class="[
                'px-2 py-1 text-xs font-medium rounded-full',
                template.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                {{ template.status === 'active' ? 'Ativo' : 'Inativo' }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Prompt -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Prompt</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-gray-700">{{ template.template_message }}</p>
        </div>
      </div>

      <!-- Mensagens Geradas -->
      <div v-if="aiMessages.length > 0">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Mensagens Geradas</h3>
        <div class="relative">
          <!-- Slider Container -->
          <div class="overflow-hidden">
            <div class="flex transition-transform duration-300 ease-in-out" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
              <div v-for="(message, index) in aiMessages" :key="index" class="w-full flex-shrink-0 px-2">
                <div class="bg-white border border-gray-200 rounded-lg p-4 h-full">
                  <div class="flex justify-between items-start">
                    <p class="text-gray-700">{{ message }}</p>
                    <button 
                      @click="copyToClipboard(message)"
                      class="text-blue-600 hover:text-blue-800 ml-2"
                      title="Copiar mensagem"
                    >
                      <i class="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-end mt-4 space-x-2">
            <button 
              @click="prevSlide"
              class="bg-white border border-gray-200 rounded-lg p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="currentSlide === 0"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              @click="nextSlide"
              class="bg-white border border-gray-200 rounded-lg p-2 w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="currentSlide === aiMessages.length - 1"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Campos Personalizados -->
      <div v-if="template.custom_fields">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Campos Personalizados</h3>
        <div class="bg-gray-50 rounded-lg p-4">
          <pre class="text-sm text-gray-700">{{ JSON.stringify(template.custom_fields, null, 2) }}</pre>
        </div>
      </div>

      <!-- Data de Criação/Atualização -->
      <div class="grid grid-cols-2 gap-4 text-sm text-gray-500">
        <div>
          <p>Criado em: {{ formatDate(template.created_at) }}</p>
        </div>
        <div>
          <p>Atualizado em: {{ formatDate(template.updated_at) }}</p>
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
import { useToast } from 'vue-toastification'
import BaseModal from '../common/BaseModal.vue'

const toast = useToast()
const currentSlide = ref(0)

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

const emit = defineEmits(['update:show'])

// Computed para processar as mensagens da IA
const aiMessages = computed(() => {
  if (!props.template.ai_responses || !props.template.ai_responses[0]) return []
  
  try {
    const responses = JSON.parse(props.template.ai_responses[0])
    return responses.map(response => {
      const key = Object.keys(response)[0]
      return response[key]
    })
  } catch (error) {
    console.error('Erro ao processar mensagens da IA:', error)
    return []
  }
})

// Função para copiar mensagem para a área de transferência
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Mensagem copiada!')
  } catch (error) {
    console.error('Erro ao copiar mensagem:', error)
    toast.error('Erro ao copiar mensagem')
  }
}

// Função para formatar data
const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

// Slider navigation methods
const nextSlide = () => {
  if (currentSlide.value < aiMessages.value.length - 1) {
    currentSlide.value++
  }
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const goToSlide = (index) => {
  currentSlide.value = index
}
</script>