<template>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
            <label class="block text-sm font-medium text-gray-700">
                Nome da Empresa
            </label>
            <input v-model="form.name" type="text" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">
                CNPJ
            </label>
            <input v-model="form.cnpj" type="text" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="00.000.000/0000-00"
                @input="formatCNPJ" />
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">
                Email
            </label>
            <input v-model="form.email" type="email" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">
                Telefone
            </label>
            <input v-model="form.phone" type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="(00) 00000-0000"
                @input="formatPhone" />
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700">
                Status
            </label>
            <select v-model="form.status"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
            </select>
        </div>

        <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="$emit('cancel')"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Cancelar
            </button>
            <button type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                :disabled="companiesStore.loading">
                <i v-if="companiesStore.loading" class="fas fa-spinner fa-spin mr-2"></i>
                {{ companiesStore.loading ? 'Salvando...' : (isEditing ? 'Salvar' : 'Criar') }}
            </button>
        </div>
    </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useCompaniesStore } from '../../stores/companies'

const props = defineProps({
    company: {
        type: Object,
        default: () => ({
            name: '',
            cnpj: '',
            email: '',
            phone: '',
            status: 'active'
        })
    },
    isEditing: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['submit', 'cancel'])

const toast = useToast()
const companiesStore = useCompaniesStore()
const form = ref({ ...props.company })

watch(() => props.company, (newCompany) => {
    // Formata o CNPJ ao receber dados para edição
    let cnpj = newCompany.cnpj || ''
    cnpj = cnpj.replace(/\D/g, '')
    if (cnpj.length === 14) {
        cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    form.value = { ...newCompany, cnpj }
}, { deep: true })

const formatCNPJ = (event) => {
    let value = event.target.value.replace(/\D/g, '')
    if (value.length <= 14) {
        value = value.replace(/^(\d{2})(\d)/, '$1.$2')
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2')
        value = value.replace(/(\d{4})(\d)/, '$1-$2')
    }
    form.value.cnpj = value
}

const formatPhone = (event) => {
    let value = event.target.value.replace(/\D/g, '')
    if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2')
        value = value.replace(/(\d)(\d{4})$/, '$1-$2')
    }
    form.value.phone = value
}

const handleSubmit = async () => {
    try {
        let result
        if (props.isEditing) {
            result = await companiesStore.updateCompany(form.value)
        } else {
            result = await companiesStore.createCompany(form.value)
        }
        
        emit('submit', result)
        toast.success(props.isEditing ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!')
    } catch (error) {
        console.error('Erro ao salvar empresa:', error)
        toast.error('Erro ao salvar empresa')
    }
}
</script> 