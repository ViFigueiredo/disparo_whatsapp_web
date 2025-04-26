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
        v-model="form.connectionId"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        @change="updateSelectedConnection"
      >
        <option value="">Selecione uma conexão</option>
        <option 
          v-for="connection in connections" 
          :key="connection.ownerJid" 
          :value="connection.ownerJid"
        >
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
        <option 
          v-for="list in validationLists" 
          :key="list.id" 
          :value="list.id"
        >
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
import { ref, onMounted, watch } from 'vue'
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

// Dados reativos
const connections = ref([])
const validationLists = ref([])
const selectedConnection = ref(null)

const form = ref({
  name: '',
  message: '',
  customFields: [],
  connectionId: '',
  connection: null,
  validationListId: null,
  output: {
    Resposta1: '',
    Resposta2: '',
    Resposta3: '',
    Resposta4: '',
    Resposta5: ''
  }
})

// Métodos
const updateSelectedConnection = () => {
  selectedConnection.value = connections.value.find(
    c => c.ownerJid === form.value.connectionId
  )
  form.value.connection = selectedConnection.value
}

const addCustomField = () => {
  form.value.customFields.push({ name: '', value: '' })
}

const removeCustomField = (index) => {
  form.value.customFields.splice(index, 1)
}

// Fetch data
const fetchConnections = async () => {
  try {
    const response = await fetch(webhooks.connections.list)
    
    if (!response.ok) throw new Error('Erro ao buscar conexões')
    connections.value = await response.json()
    console.log(connections.value);
  } catch (error) {
    console.error('Erro ao carregar conexões:', error)
    toast.error('Erro ao carregar conexões')
  }
}

const fetchValidationLists = async () => {
  try {
    const response = await fetch(webhooks.validation.list)
    if (!response.ok) throw new Error('Erro ao carregar listas de validação')
    const data = await response.json()
    
    const leads = data[0]?.leads || []
    const lists = data[1]?.lists || []
    
    validationLists.value = lists.map(list => ({
      id: list.id,
      name: list.name,
      leads: leads.filter(lead => lead.list_id === list.id)
    }))
  } catch (error) {
    console.error('Erro ao carregar listas:', error)
    toast.error('Erro ao carregar listas de validação')
  }
}

// Inicialização
const initializeForm = () => {
  if (!props.template) return

  // Preenche os campos básicos
  form.value = {
    ...form.value,
    name: props.template.template_name || '',
    message: props.template.template_message || '',
    customFields: props.template.customFields || [],
    output: props.template.output || form.value.output
  }

  // Define a conexão selecionada
  if (props.template.template_connection) {
    form.value.connectionId = props.template.template_connection.ownerJid
    form.value.connection = props.template.template_connection
  }

  // Define a lista selecionada
  if (props.template.template_list_id) {
    form.value.validationListId = props.template.template_list_id
  }
}

// Watch para quando os dados forem carregados
watch([connections, validationLists], () => {
  initializeForm()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([fetchConnections(), fetchValidationLists()])
    initializeForm()
  } catch (error) {
    console.error('Erro ao inicializar:', error)
    toast.error('Erro ao carregar dados iniciais')
  }
})

// Submit
const handleSubmit = () => {
  if (!form.value.connectionId) {
    toast.error('Selecione uma conexão')
    return
  }

  if (!form.value.validationListId) {
    toast.error('Selecione uma lista de validação')
    return
  }

  const selectedList = validationLists.value.find(
    list => list.id === form.value.validationListId
  )

  if (!selectedList || !selectedList.leads?.length) {
    toast.warning('A lista selecionada não possui leads')
    return
  }

  const formData = {
    ...form.value,
    validationList: selectedList,
    leads: selectedList.leads,
    template_name: form.value.name,
    template_message: form.value.message,
    template_list_id: form.value.validationListId,
    template_list_name: selectedList.name
  }

  emit('submit', formData)
}
</script>