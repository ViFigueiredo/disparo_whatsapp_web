<template>
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold text-gray-900">Empresas</h2>
    <ListFilterSort 
      :search="search" 
      :sort="sort" 
      @update:search="$emit('update:search', $event)"
      @update:sort="$emit('update:sort', $event)"
      search-placeholder="Buscar por nome..."
    >
      <base-button @click="$emit('new-company')">
        <i class="fas fa-plus mr-2"></i>
        Nova Empresa
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
  }
})

defineEmits(['update:search', 'update:sort', 'new-company'])
</script> 