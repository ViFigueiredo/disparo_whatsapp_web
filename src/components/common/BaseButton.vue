<template>
  <button
    :class="[
      'inline-flex items-center px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2',
      variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' :
      variant === 'secondary' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500' :
      'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
    ]"
    :disabled="loading"
  >
    <span v-if="loading" class="mr-2">
      <i class="fas fa-spinner fa-spin"></i>
    </span>
    <slot></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped></style>