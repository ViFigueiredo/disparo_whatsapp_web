<template>
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold text-gray-900">Empresas ({{ companies.length }})</h2>
    <ListFilterSort :search="search" :sort="sort" @update:search="$emit('update:search', $event)"
      @update:sort="$emit('update:sort', $event)" search-placeholder="Buscar por nome...">
      <base-button @click="$emit('new-company')">
        <i class="fas fa-plus"></i>
      </base-button>
    </ListFilterSort>
  </div>
</template>

<script setup>
import ListFilterSort from '../common/ListFilterSort.vue'
import BaseButton from '../common/BaseButton.vue'

defineProps({
  search: {
    type: String,
    required: true
  },
  sort: {
    type: String,
    required: true
  },
  companies: {
    type: Array,
    required: true
  }
})

defineEmits(['update:search', 'update:sort', 'new-company'])
</script>