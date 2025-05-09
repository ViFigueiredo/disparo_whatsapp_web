<template>
  <!-- Overlay de Loading -->
  <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-5 rounded-lg shadow-lg flex flex-col items-center">
      <div class="text-blue-600 mb-3" role="status">
        <i class="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
      </div>
      <p class="text-gray-700">Carregando dados...</p>
    </div>
  </div>

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
        @change="handleConnectionChange"
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
const loading = ref(false) // Novo estado para controlar o loading

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
    loading.value = true // Ativar loading
    
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
  } finally {
    loading.value = false // Desativar loading independente do resultado
  }
}

const fetchConnections = async () => {
  try {
    loading.value = true // Ativar loading
    const response = await fetch(webhooks.connections.list)
    
    if (!response.ok) throw new Error('Erro ao buscar conexões')
    connections.value = await response.json()
    console.log('Conexões carregadas:', connections.value)
  } catch (error) {
    console.error('Erro ao carregar conexões:', error)
    toast.error('Erro ao carregar conexões')
  } finally {
    loading.value = false // Desativar loading independente do resultado
  }
}

const fetchValidationLists = async () => {
  try {
    loading.value = true // Ativar loading
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
  } finally {
    loading.value = false // Desativar loading independente do resultado
  }
}

onMounted(async () => {
  console.log('Template recebido para edição:', props.template)
  try {
    loading.value = true // Ativar loading no início do carregamento
    
    await Promise.all([
      fetchConnections(),
      fetchValidationLists()
    ])
    
    if (props.template) {
      console.log('Estrutura do template recebido:', JSON.stringify(props.template, null, 2))
      
      // Encontra a conexão correspondente - verifica diferentes formatos possíveis
      let matchingConnection = null
      
      if (typeof props.template.template_connection === 'string') {
        // Se for uma string, procura pelo nome
        matchingConnection = connections.value.find(c => c.name === props.template.template_connection)
      } else if (props.template.template_connection && props.template.template_connection.name) {
        // Se for um objeto, procura pelo nome do objeto
        matchingConnection = connections.value.find(c => c.name === props.template.template_connection.name)
      }
      
      console.log('Conexão encontrada:', matchingConnection)
      
      // Procura a lista usando o ID do template
      const listId = parseInt(props.template.template_list_id)
      
      // Encontra a lista nas listas disponíveis
      const matchingList = validationLists.value.find(list => 
        list.id === listId
      )

      // MODIFICAÇÃO IMPORTANTE: Se for integração de negócio, carrega os templates ANTES de preencher o formulário
      if (matchingConnection && matchingConnection.integration === 'WHATSAPP-BUSINESS') {
        console.log('Detectada conexão business na edição, carregando templates...')
        await fetchBusinessTemplates(matchingConnection)
      }

      // Agora preenchemos o formulário DEPOIS de carregar os templates
      form.value = {
        name: props.template.template_name,
        message: props.template.template_message || '',
        connection: matchingConnection || null,
        validationListId: listId,
        customFields: props.template.customFields || [],
        businessTemplate: null, // Será definido abaixo
        output: props.template.output || {
          Resposta1: '',
          Resposta2: '',
          Resposta3: '',
          Resposta4: '',
          Resposta5: ''
        }
      }
      
      // Se for integração de negócio, definimos o template de negócio
      if (matchingConnection && matchingConnection.integration === 'WHATSAPP-BUSINESS') {
        // Verificar se temos um businessTemplate salvo
        if (props.template.business_template_id) {
          form.value.businessTemplate = props.template.business_template_id
          console.log('Template de negócio selecionado pelo ID:', props.template.business_template_id)
        } else if (props.template.businessTemplate) {
          console.log('Template de negócio encontrado no objeto:', props.template.businessTemplate)
          
          // Verificar se o template está no formato de ID ou objeto completo
          let templateId = null
          
          if (typeof props.template.businessTemplate === 'string') {
            templateId = props.template.businessTemplate
          } else if (typeof props.template.businessTemplate === 'object') {
            templateId = props.template.businessTemplate.id || props.template.businessTemplate.name
          }
          
          // Definir o valor no formulário apenas se encontrarmos um ID válido
          if (templateId) {
            console.log('Definindo template de negócio para:', templateId)
            form.value.businessTemplate = templateId
            
            // Verificar se o template existe na lista carregada
            const templateExists = businessTemplates.value.some(t => t.id === templateId)
            if (!templateExists) {
              console.warn('Aviso: O template selecionado não foi encontrado na lista de templates disponíveis')
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar o formulário:', error)
    toast.error('Erro ao carregar os dados do template')
  } finally {
    loading.value = false // Desativar loading no final do carregamento
  }
})

// Modificar a função handleConnectionChange para usar fetchBusinessTemplates
const handleConnectionChange = async (event) => {
  const connection = event.value
  
  // Log da conexão selecionada
  console.log('Conexão selecionada:', connection)
  
  // Verificar se é uma conexão business
  if (connection && connection.integration === 'WHATSAPP-BUSINESS') {
    console.log('Conexão business detectada, carregando templates de negócio...')
    
    // Resetar campos que não são usados em WHATSAPP-BUSINESS
    form.value.message = ''
    form.value.customFields = []
    
    // Carregar templates de negócio usando a função existente
    await fetchBusinessTemplates(connection)
    
    // Log detalhado de cada template
    if (Array.isArray(businessTemplates.value)) {
      businessTemplates.value.forEach((template, index) => {
        console.log(`Template ${index + 1}:`, {
          id: template.id || 'N/A',
          name: template.name || 'N/A',
          language: template.language || 'N/A',
          category: template.category || 'N/A'
        })
      })
    }
  } else {
    // Resetar campo de template de negócio
    form.value.businessTemplate = null
    businessTemplates.value = []
  }
}

const handleSubmit = () => {
  submitted.value = true;
  
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
    validationList: selectedList, // Sempre incluir o objeto completo da lista de validação
    leads: selectedList.leads,
    template_name: form.value.name,
    template_connection: form.value.connection,
    template_message: form.value.message,
    template_list_id: form.value.validationListId,
    template_list_name: selectedList.name,
    businessTemplate: form.value.businessTemplate,
    integration_type: form.value.connection ? form.value.connection.integration : null
  }

  // Se for um template de negócio, incluir o objeto completo
  if (isBusinessIntegration.value && form.value.businessTemplate) {
    // Encontrar o objeto completo do template de negócio
    const selectedTemplate = businessTemplates.value.find(
      template => template.id === form.value.businessTemplate
    );
    
    if (selectedTemplate) {
      formData.businessTemplate = selectedTemplate;
      console.log('Template de negócio selecionado para envio:', selectedTemplate);
    }
  }
  
  emit('submit', formData);
};

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
/* Estilo para o spinner de loading */
/* .spinner-border {
  display: inline-block;
  width: 2rem;
  height: 2rem;
  vertical-align: text-bottom;
  border: 0.25em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  -webkit-animation: spinner-border 0.75s linear infinite;
  animation: spinner-border 0.75s linear infinite;
}

@-webkit-keyframes spinner-border {
  to { -webkit-transform: rotate(360deg); transform: rotate(360deg); }
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
} */

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