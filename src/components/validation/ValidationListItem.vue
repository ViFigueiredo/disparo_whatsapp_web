<template>
  <div class="bg-white shadow rounded-lg p-6 mb-4">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-lg font-medium text-gray-900">{{ list.name }}</h3>
        <p class="text-sm text-gray-500">Criado em: {{ formatDate(list.created_at) }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="downloadList" class="text-blue-600 hover:text-blue-800">
          <i class="fas fa-download"></i>
        </button>
        <button @click="deleteList" class="text-red-600 hover:text-red-800">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-4">
      <div class="text-center">
        <p class="text-sm text-gray-500">Total de Leads</p>
        <p class="text-2xl font-bold text-gray-900">{{ list.total_leads }}</p>
      </div>
      <div class="text-center">
        <p class="text-sm text-gray-500">Números Válidos</p>
        <p class="text-2xl font-bold text-green-600">{{ list.valid_leads }}</p>
      </div>
      <div class="text-center">
        <p class="text-sm text-gray-500">Números Inválidos</p>
        <p class="text-2xl font-bold text-red-600">{{ list.invalid_leads }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useToast } from 'vue-toastification'
import { webhooks } from '@/config/webhooks'

const props = defineProps({
  list: {
    type: Object,
    required: true
  }
})

const formatDate = (dateString) => {
  if (!dateString) return 'Data inválida'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

const toast = useToast()

const emit = defineEmits(['download', 'deleted'])

const deleteList = async () => {
  if (!confirm('Tem certeza que deseja excluir esta lista?')) {
    return
  }

  try {
    const response = await fetch(`${webhooks.validation.delete}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: props.list.id
      })
    })

    if (!response.ok) {
      throw new Error('Erro ao excluir lista')
    }

    toast.success('Lista excluída com sucesso')
    emit('deleted', props.list.id)
  } catch (error) {
    console.error('Erro ao excluir lista:', error)
    toast.error('Erro ao excluir lista')
  }
}

const downloadList = () => {
  emit('download', props.list.id)
}
</script>