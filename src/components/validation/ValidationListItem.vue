<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-lg font-medium text-gray-900">{{ list.name }}</h3>
        <p class="mt-1 text-sm text-gray-500">
          Criado em: {{ new Date(list.createdAt).toLocaleDateString() }}
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="text-gray-400 hover:text-gray-500"
          @click="downloadCsv"
        >
          <i class="fas fa-download"></i>
        </button>
        <button
          class="text-red-400 hover:text-red-500"
          @click="deleteList"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-4 text-center">
      <div class="bg-gray-50 rounded p-3">
        <p class="text-sm font-medium text-gray-500">Total de Leads</p>
        <p class="mt-1 text-lg font-semibold text-gray-900">{{ list.totalLeads }}</p>
      </div>
      <div class="bg-green-50 rounded p-3">
        <p class="text-sm font-medium text-green-500">Números Válidos</p>
        <p class="mt-1 text-lg font-semibold text-green-600">{{ list.validLeads }}</p>
      </div>
      <div class="bg-red-50 rounded p-3">
        <p class="text-sm font-medium text-red-500">Números Inválidos</p>
        <p class="mt-1 text-lg font-semibold text-red-600">{{ list.invalidLeads }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  list: {
    type: Object,
    required: true
  }
})

const toast = useToast()

const downloadCsv = () => {
  // Implementar lógica de download
  toast.info('Download iniciado')
}

const deleteList = () => {
  // Implementar lógica de exclusão
  toast.success('Lista excluída com sucesso')
}
</script>