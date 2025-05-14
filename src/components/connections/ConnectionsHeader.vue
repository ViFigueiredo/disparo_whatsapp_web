<template>
  <div>
    <div class="flex justify-between items-center mb-2">
      <h2 class="text-2xl font-bold text-gray-900">Conexões de WhatsApp ({{ connections.length }})</h2>
      <div class="flex gap-2">
        <button @click="showFilters = !showFilters" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          <i class="fas fa-filter"></i>
        </button>
        <button @click="emit('new-connection')" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          <i class="fas fa-plus"></i>
        </button>
        <button @click="emit('refresh')" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700">
          <i class="fas fa-refresh"></i>
        </button>
      </div>
    </div>
    <div v-if="showFilters" class="flex flex-col md:flex-row md:items-center gap-4">
      <div class="relative w-full md:w-64">
        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nome..."
          class="py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
        />
      </div>
      <select v-model="status" @change="emit('update:status', status)" class="py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="">Todos</option>
        <option value="open">Conectados</option>
        <option value="disconnected">Desconectados</option>
      </select>
      <select v-model="company" @change="emit('update:company', company)" class="py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <option value="">Todas as empresas</option>
        <option value="none">Sem empresa vinculada</option>
        <option v-for="companyObj in companies" :key="companyObj.id" :value="companyObj.id">
          {{ companyObj.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  search: String,
  sort: String,
  status: String,
  company: String,
  companies: {
    type: Array,
    default: () => []
  },
  connections: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:search', 'update:sort', 'update:status', 'update:company', 'new-connection', 'refresh'])

const search = ref(props.search)
const sort = ref(props.sort)
const status = ref(props.status)
const company = ref(props.company)
const showFilters = ref(false)

watch(search, val => emit('update:search', val))
watch(sort, val => emit('update:sort', val))
watch(status, val => emit('update:status', val))
watch(company, val => emit('update:company', val))
</script>