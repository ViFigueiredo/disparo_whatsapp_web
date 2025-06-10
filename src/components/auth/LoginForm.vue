<template>
  <form class="space-y-6" @submit.prevent="$emit('submit')">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email
      </label>
      <div class="mt-1">
        <input id="email" v-model="email" type="email" required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': error }" />
      </div>
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">
        Senha
      </label>
      <div class="mt-1">
        <input id="password" v-model="password" type="password" required
          class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500': error }" />
      </div>
    </div>

    <div v-if="error" class="text-sm text-red-600">
      {{ error }}
    </div>

    <div>
      <button type="submit" :disabled="isLoading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
        <i v-if="isLoading" class="fas fa-spinner fa-spin mr-2"></i>
        {{ isLoading ? 'Entrando...' : 'Entrar' }}
      </button>
    </div>

    <div class="flex items-center justify-center">
      <div class="text-sm">
        <a href="#" @click.prevent="$emit('forgot-password')" class="font-medium text-blue-600 hover:text-blue-500">
          Esqueceu sua senha?
        </a>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { defineOptions } from 'vue'

defineOptions({
  inheritAttrs: false
})

const email = ref('')
const password = ref('')

defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit', 'forgot-password', 'update:email', 'update:password'])

// Watch para emitir eventos de atualização
watch(email, (newValue) => {
  emit('update:email', newValue)
})

watch(password, (newValue) => {
  emit('update:password', newValue)
})
</script>