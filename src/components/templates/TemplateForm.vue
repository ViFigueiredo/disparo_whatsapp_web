<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Nome do Template -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Nome do Template
      </label>
      <input
        v-model="form.name"
        type="text"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Digite o nome do template"
      />
    </div>

    <!-- Conexão -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Conexão
      </label>
      <select
        v-model="form.connection"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
      <option value="">Selecione uma conexão</option>
        <option v-for="connection in connections" :key="connection.ownerJid" :value="connection">
          {{ connection.name }}
        </option>
      </select>
    </div>

    <!-- Mensagem -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Mensagem
      </label>
      <textarea
        v-model="form.message"
        rows="4"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Digite sua mensagem. Use {{variavel}} para campos dinâmicos"
      ></textarea>
    </div>

    <!-- Campos Personalizados -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Campos Personalizados
      </label>
      <div class="space-y-2">
        <div
          v-for="(field, index) in form.customFields"
          :key="index"
          class="flex gap-2"
        >
          <input
            v-model="field.name"
            type="text"
            class="flex-1 rounded-md border-gray-300"
            placeholder="Nome do campo"
          />
          <input
            v-model="field.value"
            type="text"
            class="flex-1 rounded-md border-gray-300"
            placeholder="Valor padrão"
          />
          <button
            type="button"
            @click="removeCustomField(index)"
            class="text-red-600 hover:text-red-800"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <button
          type="button"
          @click="addCustomField"
          class="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <i class="fas fa-plus"></i>
          Adicionar Campo
        </button>
      </div>
    </div>

    <!-- Seleção de Lista Validada -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Lista de Leads Validada
      </label>
      <select
        v-model="form.validationListId"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
      >
        <option value="">Selecione uma lista</option>
        <option v-for="list in validationLists" :key="list.id" :value="list.id">
          {{ list.name }}
        </option>
      </select>
    </div>

    <!-- Botões -->
    <div class="flex justify-end gap-3">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        {{ template ? 'Atualizar' : 'Criar' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { webhooks } from '@/config/webhooks'
import { useToast } from 'vue-toastification'

const toast = useToast()

const props = defineProps({
  template: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['submit', 'cancel'])
const connections = ref([])

const addCustomField = () => {
  form.value.customFields.push({ name: '', value: '' })
}

const removeCustomField = (index) => {
  form.value.customFields.splice(index, 1)
}

const fetchConnections = async () => {
  try {
    const response = await fetch(webhooks.connections.list)
    if (!response.ok) {
      throw new Error('Erro ao buscar conexões')
    }
    const data = await response.json()
    connections.value = data
  } catch (error) {
    console.error('Erro ao carregar conexões:', error)
    toast.error('Erro ao carregar conexões')
  }
}

const validationLists = ref([])

const fetchValidationLists = async () => {
  try {
    const response = await fetch(webhooks.validation.list)
    if (!response.ok) {
      throw new Error('Erro ao carregar listas de validação')
    }
    const data = await response.json()
    console.log('Dados recebidos da API:', data)
    
    // Extrai os leads do primeiro objeto do array
    const leads = data[0]?.leads || []
    
    // Extrai as listas do segundo objeto do array
    const lists = data[1]?.lists || []
    
    validationLists.value = lists.map(list => {
      // Encontra os leads correspondentes a esta lista
      const listLeads = leads.filter(lead => lead.list_id === list.id)
      return {
        id: list.id,
        name: list.name,
        leads: listLeads
      }
    })
    
    console.log('Listas processadas:', validationLists.value)
  } catch (error) {
    console.error('Erro ao carregar listas:', error)
    toast.error('Erro ao carregar listas de validação')
  }
}

// Remova o onMounted duplicado e mantenha apenas um
onMounted(async () => {
  await Promise.all([
    fetchConnections(),
    fetchValidationLists()
  ])
  
  if (props.template) {
    form.value = { ...props.template }
  }
})

const form = ref({
  name: '',
  message: '',
  customFields: [],
  connection: '',
  validationListId: null, // Mudado de string vazia para null
  validationList: null
})

const handleSubmit = () => {
  console.log('ID da lista selecionada:', form.value.validationListId)
  console.log('Todas as listas disponíveis:', validationLists.value)
  
  // Encontra a lista selecionada
  const selectedList = validationLists.value.find(list => list.id === form.value.validationListId)
  console.log('Lista selecionada:', selectedList)
  
  if (!selectedList) {
    toast.error('Lista de validação não encontrada')
    return
  }

  // Verifica se leads existe e é um array
  if (!Array.isArray(selectedList.leads)) {
    console.error('Leads não é um array:', selectedList.leads)
    toast.error('Formato de leads inválido')
    return
  }

  // Verifica se há leads
  if (selectedList.leads.length === 0) {
    console.warn('Lista sem leads:', selectedList)
    toast.warning('A lista selecionada não possui leads')
    return
  }

  const formData = { 
    ...form.value,
    validationList: selectedList,
    leads: selectedList.leads
  }
  
  console.log('Dados do formulário a serem enviados:', formData)
  emit('submit', formData)
}
</script>