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
          <span>{{ template.template_connection }}</span>
        </div>
      </div>

      <!-- Mensagem -->
      <div class="space-y-2">
        <h4 class="text-sm font-medium text-gray-700">Mensagem</h4>
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <p class="whitespace-pre-wrap">{{ template.template_message }}</p>
        </div>
      </div>

      <!-- Lista de Validação -->
      <div v-if="template.template_list_id" class="space-y-2">
        <h4 class="text-sm font-medium text-gray-700">Lista de Validação</h4>
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium text-gray-900">ID da Lista: {{ template.template_list_id }}</span>
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
import { defineProps, defineEmits, onMounted, watch } from 'vue'
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

// Adicionar watch para debug
watch(() => props.template, (newVal) => {
  console.log('Template recebido no modal:', newVal)
}, { immediate: true })

defineEmits(['update:show'])
</script>