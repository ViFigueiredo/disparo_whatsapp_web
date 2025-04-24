<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
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

    <!-- Upload CSV -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Arquivo CSV
      </label>
      <input
        type="file"
        accept=".csv"
        @change="handleFileUpload"
        class="mt-1 block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
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
        {{ template ? 'Atualizar' : 'Criar' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  template: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  name: '',
  message: '',
  customFields: [],
  contacts: []
})

const addCustomField = () => {
  form.value.customFields.push({ name: '' })
}

const removeCustomField = (index) => {
  form.value.customFields.splice(index, 1)
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n')
      const headers = lines[0].toLowerCase().split(',')
      
      if (!headers.includes('nome') || !headers.includes('numero')) {
        alert('O arquivo CSV deve conter as colunas "nome" e "numero"')
        event.target.value = ''
        return
      }

      form.value.contacts = lines.slice(1).map(line => {
        const values = line.split(',')
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim()
          return obj
        }, {})
      })
    }
    reader.readAsText(file)
  }
}

const handleSubmit = () => {
  emit('submit', { ...form.value })
}

onMounted(() => {
  if (props.template) {
    form.value = { ...props.template }
  }
})
</script>