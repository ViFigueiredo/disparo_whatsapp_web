<template>
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold text-gray-900">Templates de Mensagem</h2>
    <base-button @click="$emit('new-template')">
      <i class="fas fa-plus"></i>
    </base-button>
  </div>
</template>

<script setup>
import BaseButton from '../common/BaseButton.vue'

defineEmits(['new-template'])
</script> 