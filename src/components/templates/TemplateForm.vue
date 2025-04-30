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
      <Dropdown
        v-model="form.connection"
        :options="connections"
        optionLabel="name"
        :optionValue="(option) => option"
        placeholder="Selecione uma conexão"
        class="w-full"
        :class="{'p-invalid': submitted && !form.connection}"
        dataKey="name"
      />
    </div>

    <!-- Mensagem - Apenas para WHATSAPP-BAILEYS -->
    <div v-if="!isBusinessIntegration">
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

    <!-- Campos Personalizados - Apenas para WHATSAPP-BAILEYS -->
    <div v-if="!isBusinessIntegration">
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

    <!-- Lista suspensa adicional para WHATSAPP-BUSINESS -->
    <div v-if="isBusinessIntegration">
      <label class="block text-sm font-medium text-gray-700">
        Template de Negócio
      </label>
      <Dropdown
        v-model="form.businessTemplate"
        :options="businessTemplates"
        optionLabel="name"
        optionValue="id"
        placeholder="Selecione um template de negócio"
        class="w-full"
        :class="{'p-invalid': submitted && isBusinessIntegration && !form.businessTemplate}"
        dataKey="id"
      />
    </div>

    <!-- Seleção de Lista Validada -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Lista de Leads Validada
      </label>
      <Dropdown
        v-model="form.validationListId"
        :options="validationLists"
        optionLabel="name"
        optionValue="id"
        placeholder="Selecione uma lista"
        class="w-full"
        :class="{'p-invalid': submitted && !form.validationListId}"
        dataKey="id"
      />
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
        {{ isCloning ? 'Clonar' : (template ? 'Atualizar' : 'Criar') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { webhooks } from '@/config/webhooks'
import { useToast } from 'vue-toastification'
import Dropdown from 'primevue/dropdown'

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
const businessTemplates = ref([]) // Nova lista para templates de negócio

const form = ref({
  name: '',
  message: '',
  customFields: [],
  connection: null,
  validationListId: null,
  businessTemplate: null, // Novo campo para template de negócio
  output: {
    Resposta1: '',
    Resposta2: '',
    Resposta3: '',
    Resposta4: '',
    Resposta5: ''
  }
})

// Computed property para verificar se é integração de negócio
const isBusinessIntegration = computed(() => {
  return form.value.connection && form.value.connection.integration === 'WHATSAPP-BUSINESS'
})

// Observar mudanças na conexão para resetar campos quando necessário
watch(() => form.value.connection, (newConnection) => {
  if (newConnection && newConnection.integration === 'WHATSAPP-BUSINESS') {
    // Resetar campos que não são usados em WHATSAPP-BUSINESS
    form.value.message = ''
    form.value.customFields = []
    
    // Carregar templates de negócio
    fetchBusinessTemplates(newConnection)
  } else {
    // Resetar campo de template de negócio
    form.value.businessTemplate = null
    businessTemplates.value = []
  }
}, { deep: true })

// Nova função para buscar templates de negócio
const fetchBusinessTemplates = async (connection) => {
  try {
    // Verificar se temos uma conexão válida
    if (!connection || !connection.name) {
      businessTemplates.value = []
      return
    }
    
    console.log('Buscando templates de negócio para a conexão:', connection.name)
    
    // Fazer a chamada para a API com o nome da conexão
    const response = await fetch(`${webhooks.business.templates}?connection=${connection.name}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar templates de negócio: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Dados recebidos:', data)
    
    // Processar os dados recebidos
    if (Array.isArray(data)) {
      businessTemplates.value = data.map(template => ({
        id: template.id || template.name,
        name: template.name,
        language: template.language || 'pt_BR',
        status: template.status || 'APPROVED',
        category: template.category || 'MARKETING'
      }))
    } else {
      businessTemplates.value = []
    }
    
    console.log('Templates de negócio carregados:', businessTemplates.value)
  } catch (error) {
    console.error('Erro ao carregar templates de negócio:', error)
    toast.error(`Erro ao carregar templates de negócio: ${error.message}`)
    businessTemplates.value = []
  }
}

const fetchConnections = async () => {
  try {
    const response = await fetch(webhooks.connections.list)
    
    if (!response.ok) throw new Error('Erro ao buscar conexões')
    connections.value = await response.json()
    console.log('Conexões carregadas:', connections.value)
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
    
    // Processa os dados recebidos
    if (Array.isArray(data) && data.length >= 2) {
      const leads = data[0]?.leads || []
      const lists = data[1]?.lists || []
      
      // Mapeia as listas e associa os leads correspondentes
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

onMounted(async () => {
  try {
    await Promise.all([
      fetchConnections(),
      fetchValidationLists()
    ])
    
    if (props.template) {
      // Encontra a conexão correspondente
      const matchingConnection = connections.value.find(c => 
        c.name === props.template.template_connection.name
      )
      
      // Procura a lista usando o ID do template
      const listId = parseInt(props.template.template_list_id)
      
      // Encontra a lista nas listas disponíveis
      const matchingList = validationLists.value.find(list => 
        list.id === listId
      )

      await nextTick(() => {
        form.value = {
          name: props.template.template_name,
          message: props.template.template_message || '',
          connection: matchingConnection || null,
          validationListId: listId,
          customFields: props.template.customFields || [],
          businessTemplate: props.template.businessTemplate || null,
          output: props.template.output || {
            Resposta1: '',
            Resposta2: '',
            Resposta3: '',
            Resposta4: '',
            Resposta5: ''
          }
        }
        
        // Se for integração de negócio, carrega os templates
        if (matchingConnection && matchingConnection.integration === 'WHATSAPP-BUSINESS') {
          fetchBusinessTemplates()
        }
      })
    }
  } catch (error) {
    console.error('Erro ao inicializar o formulário:', error)
    toast.error('Erro ao carregar os dados do template')
  }
})

const handleSubmit = () => {
  submitted.value = true
  
  if (!form.value.connection) {
    toast.error('Selecione uma conexão')
    return
  }

  if (!form.value.validationListId) {
    toast.error('Selecione uma lista de validação')
    return
  }
  
  // Validação específica para integração de negócio
  if (isBusinessIntegration.value && !form.value.businessTemplate) {
    toast.error('Selecione um template de negócio')
    return
  }
  
  // Validação específica para integração Baileys
  if (!isBusinessIntegration.value && !form.value.message) {
    toast.error('Digite uma mensagem')
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
    template_connection: form.value.connection,
    template_message: form.value.message,
    template_list_id: form.value.validationListId,
    template_list_name: selectedList.name,
    businessTemplate: form.value.businessTemplate
  }

  emit('submit', formData)
}

const addCustomField = () => {
  form.value.customFields.push({ name: '', value: '' })
}

const removeCustomField = (index) => {
  form.value.customFields.splice(index, 1)
}

const submitted = ref(false)

const isCloning = computed(() => {
  return props.template && !props.template.id
})
</script>

<style>
.p-dropdown {
  width: 100%;
  border-radius: 0.375rem;
  background-color: white;
}

.p-dropdown.p-invalid {
  border-color: #dc2626;
}

.p-dropdown-panel .p-dropdown-items .p-dropdown-item {
  padding: 0.75rem 1rem;
}

.p-dropdown-panel .p-dropdown-items .p-dropdown-item:hover {
  background-color: #f3f4f6;
}
</style>