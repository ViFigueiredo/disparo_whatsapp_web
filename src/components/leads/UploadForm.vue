<template>
  <form @submit.prevent="$emit('submit')" class="space-y-4">
    <!-- Seleção de Empresa (apenas para admin) -->
    <div v-if="isAdmin">
      <label class="block text-sm font-medium text-gray-700">
        Empresa
      </label>
      <select v-model="form.companyId" required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        <option value="">Selecione uma empresa</option>
        <option v-for="company in companies" :key="company.id" :value="company.id">
          {{ company.name }}
        </option>
      </select>
    </div>

    <!-- Nome da Lista -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Nome da Lista
      </label>
      <input v-model="form.name" type="text" required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Digite o nome da lista" />
    </div>

    <!-- Upload CSV -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Arquivo CSV
      </label>
      <input type="file" accept=".csv" @change="$emit('file-upload', $event)" required class="mt-1 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100" />
      <p class="mt-1 text-sm text-gray-500">
        O arquivo deve ser CSV com colunas: nome, numero
      </p>
    </div>

    <!-- Estatísticas de Validação -->
    <div v-if="form.validated" class="mt-4 bg-gray-50 rounded-lg p-4">
      <h3 class="text-lg font-medium text-gray-900 mb-2">Resultado da Validação</h3>
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <p class="text-sm text-gray-500">Total de Números</p>
          <p class="text-2xl font-bold text-gray-900">{{ form.leads.length }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-500">Números Válidos</p>
          <p class="text-2xl font-bold text-green-600">{{ validNumbers }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-500">Números Inválidos</p>
          <p class="text-2xl font-bold text-red-600">{{ invalidNumbers }}</p>
        </div>
      </div>
    </div>

    <!-- Botões -->
    <div class="flex justify-end gap-3 mt-6">
      <button type="button" @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
        Cancelar
      </button>
      <button type="button" @click="$emit('validate')" :disabled="!form.leads.length"
        class="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed">
        Validar Números
      </button>
      <button type="submit" :disabled="!form.leads.length || !form.validated || isSubmitting"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
        <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
        {{ isSubmitting ? 'Salvando...' : 'Salvar Lista' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  isSubmitting: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  companies: {
    type: Array,
    default: () => []
  }
})

defineEmits(['submit', 'cancel', 'validate', 'file-upload'])

const validNumbers = computed(() => {
  return props.form.leads.filter(lead => lead.exists).length
})

const invalidNumbers = computed(() => {
  return props.form.leads.filter(lead => !lead.exists).length
})
</script>