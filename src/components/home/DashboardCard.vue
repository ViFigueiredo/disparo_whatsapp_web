<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="p-5">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <i :class="['fas', `fa-${icon}`, iconColor, 'text-2xl']"></i>
        </div>
        <div class="ml-5 w-0 flex-1">
          <dt class="text-lg font-medium text-gray-900 truncate">
            {{ title }}
          </dt>
          <dd class="flex items-baseline text-sm text-gray-600">
            {{ description }}
          </dd>
        </div>
      </div>
    </div>
    <div class="bg-gray-50 px-5 py-3">
      <div class="text-sm flex justify-end">
        <router-link
          :to="route"
          class="font-medium text-blue-600 hover:text-blue-900"
        >
          {{ linkText }} <i class="fas fa-chevron-right ml-1"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    required: true,
    default: 'text-gray-500'
  },
  color: {
    type: String,
    required: true
  },
  route: {
    type: String,
    required: true
  },
  linkText: {
    type: String,
    required: true
  }
})
</script> 