<template>
  <div class="bg-white rounded-lg shadow-md p-6 space-y-4">
    <div class="flex justify-between items-start">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">{{ template.template_name }}</h3>
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
          class="text-red-600 hover:text-red-700 relative"
          title="Excluir"
          :disabled="isDeleting"
        >
          <i class="fas" :class="isDeleting ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
        </button>
      </div>
    </div>
    
    <div class="text-sm text-gray-600">
      <p class="line-clamp-3">{{ template.message }}</p>
    </div>

    <div class="flex justify-between items-center pt-4 border-t border-gray-200">
      <div class="flex flex-col text-sm">
        <span class="text-gray-500">Lista: {{ template.template_list_name }}</span>
        <span class="text-gray-500">Leads: {{ totalLeads }}</span>
      </div>
      <div class="flex justify-end space-x-2">
        <button
          @click="$emit('preview', template)"
          class="text-blue-600 hover:text-blue-800"
        >
          <i class="fas fa-eye"></i>
          Detalhes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { webhooks } from '@/config/webhooks'

const toast = useToast()

const props = defineProps({
  template: {
    type: Object,
    required: true
  }
})

const validationLists = ref([])
const emit = defineEmits(['edit', 'clone', 'preview', 'validate', 'delete'])
const isDeleting = ref(false)

// Computed property para calcular o total de leads do template atual
const totalLeads = computed(() => {
  const templateList = validationLists.value.find(list => 
    list.id === parseInt(props.template.template_list_id)
  )
  return templateList?.leads?.length || 0
})

const fetchValidationLists = async () => {
  try {
    const response = await fetch(webhooks.validation.list)
    if (!response.ok) throw new Error('Erro ao carregar listas de validação')
    const data = await response.json()
    
    if (Array.isArray(data) && data.length >= 2) {
      const leads = data[0]?.leads || []
      const lists = data[1]?.lists || []
      
      validationLists.value = lists.map(list => {
        const listLeads = leads.filter(lead => lead.list_id === parseInt(list.id))
        return {
          id: parseInt(list.id),
          name: list.name,
          leads: listLeads
        }
      })
    }
  } catch (error) {
    console.error('Erro ao carregar listas:', error)
    toast.error('Erro ao carregar listas de validação')
  }
}

onMounted(() => {
  fetchValidationLists()
})
</script>

<style scoped>
.fa-spin {
  animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>