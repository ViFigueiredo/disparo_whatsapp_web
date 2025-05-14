<template>
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold text-gray-900">Usuários ({{ users.length }})</h2>
    <base-button @click="$emit('new-user')">
      <i class="fas fa-plus"></i>
    </base-button>
  </div>
</template>

<script setup>
import BaseButton from '../common/BaseButton.vue'

defineProps({
  users: {
    type: Array,
    required: true
  }
})

defineEmits(['new-user'])
</script>