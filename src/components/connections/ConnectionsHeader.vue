<template>
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold text-gray-900">Conexões de WhatsApp ({{ connections.length }})</h2>
    <ListFilterSort :search="search" :sort="sort" @update:search="$emit('update:search', $event)"
      @update:sort="$emit('update:sort', $event)" search-placeholder="Buscar por nome...">
      <select :value="status" @input="$emit('update:status', $event.target.value)"
        class="py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-2">
        <option value="">Todas</option>
        <option value="open">Conectado</option>
        <option value="disconnected">Desconectado</option>
      </select>
      <base-button @click="$emit('new-connection')">
        <i class="fas fa-plus"></i>
      </base-button>
      <base-button @click="$emit('refresh')">
        <i class="fas fa-sync-alt"></i>
      </base-button>
    </ListFilterSort>
  </div>
</template>

<script setup>
import ListFilterSort from '../common/ListFilterSort.vue'
import BaseButton from '../common/BaseButton.vue'

const props = defineProps({
  search: {
    type: String,
    required: true
  },
  sort: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  connections: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:search', 'update:sort', 'update:status', 'new-connection', 'refresh'])
</script>