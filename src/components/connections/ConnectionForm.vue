<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Nome da Conexão -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Nome da Conexão
      </label>
      <input 
        v-model="formData.name" 
        type="text" 
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Digite o nome da conexão" 
      />
    </div>

    <!-- Empresa (apenas para admin) -->
    <div v-if="isAdmin">
      <label class="block text-sm font-medium text-gray-700">
        Empresa
      </label>
      <select 
        v-model="formData.company_id" 
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option value="" disabled>Selecione a empresa</option>
        <option v-for="company in companies" :key="company.id" :value="company.id">
          {{ company.name }}
        </option>
      </select>
    </div>

    <!-- Botões -->
    <div class="flex justify-end gap-3 mt-6">
      <button 
        type="button" 
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancelar
      </button>
      <button 
        type="submit"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        :disabled="isSubmitting"
      >
        <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
        {{ isSubmitting ? 'Salvando...' : submitButtonText }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  connection: {
    type: Object,
    default: () => ({})
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  companies: {
    type: Array,
    default: () => []
  },
  submitButtonText: {
    type: String,
    default: 'Salvar'
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formData = reactive({
  id: props.connection.id || '',
  name: props.connection.name || '',
  company_id: props.connection.company_id || ''
})

const handleSubmit = () => {
  emit('submit', { ...formData })
}
</script>