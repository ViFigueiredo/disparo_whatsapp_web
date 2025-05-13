<template>
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold text-gray-900">Usuários</h2>
    <base-button @click="$emit('new-user')">
      <i class="fas fa-plus mr-2"></i>
      Novo Usuário
    </base-button>
  </div>
</template>

<script setup>
import BaseButton from '../common/BaseButton.vue'

defineEmits(['new-user'])
</script> 