<template>
  <div class="bg-white rounded-lg shadow p-4 space-y-4">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-lg font-medium text-gray-900">{{ template.name }}</h3>
        <p class="text-sm text-gray-500">{{ template.connection }}</p>
      </div>
      <div class="flex space-x-4">
        <button
          @click="$emit('execute', template)"
          class="text-yellow-600 hover:text-yellow-800"
          title="Executar"
          >
          <i class="fas fa-play"></i>
        </button>
        <button
          @click="$emit('edit', template)"
          class="text-blue-600 hover:text-blue-800"
          title="Editar"
        >
          <i class="fas fa-edit"></i>
        </button>
        <button
          @click="$emit('clone', template)"
          class="text-green-600 hover:text-green-800"
          title="Clonar"
        >
          <i class="fas fa-clone"></i>
        </button>
        <button
          @click="$emit('delete', template)"
          class="text-red-600 hover:text-red-700"
          title="Excluir"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    
    <div class="text-sm text-gray-600">
      <p class="line-clamp-3">{{ template.message }}</p>
    </div>

    <div class="flex justify-between items-center pt-4 border-t border-gray-200">
      <span class="text-sm text-gray-500">
        Lista: {{ template.template_list_name }}
      </span>
      <div class="flex justify-end space-x-2">
        <button
          @click="$emit('preview', template)"
          class="text-blue-600 hover:text-blue-800"
        >
          <i class="fas fa-eye"></i>
          Ver Detalhes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  template: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'clone', 'preview', 'validate', 'delete'])
</script>

<style scoped></style>