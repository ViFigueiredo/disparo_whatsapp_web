<template>
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold text-gray-900">Validação de Leads</h2>
    <base-button @click="$emit('upload-list')">
      <i class="fas fa-upload"></i>
    </base-button>
  </div>
</template>

<script setup>
import BaseButton from '../common/BaseButton.vue'

defineEmits(['upload-list'])
</script> 