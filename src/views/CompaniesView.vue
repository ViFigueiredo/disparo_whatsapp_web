<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900">Empresas</h2>
            <base-button @click="openCreateCompanyModal">
                <i class="fas fa-plus mr-2"></i>
                Nova Empresa
            </base-button>
        </div>

        <!-- Lista de Empresas -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nome
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            CNPJ
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="company in companies" :key="company.id">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">{{ company.name }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-500">{{ formatCNPJ(company.cnpj) }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-500">{{ company.email }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="[
                                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                                company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            ]">
                                {{ company.status === 'active' ? 'Ativo' : 'Inativo' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button @click="editCompany(company)" class="text-blue-600 hover:text-blue-900 mr-4">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button @click="deleteCompany(company)" class="text-red-600 hover:text-red-900">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal de Criação/Edição de Empresa -->
        <base-modal v-model="showCompanyModal" :title="isEditing ? 'Editar Empresa' : 'Nova Empresa'">
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">
                        Nome da Empresa
                    </label>
                    <input v-model="companyForm.name" type="text" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">
                        CNPJ
                    </label>
                    <input v-model="companyForm.cnpj" type="text" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="00.000.000/0000-00" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input v-model="companyForm.email" type="email" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">
                        Telefone
                    </label>
                    <input v-model="companyForm.phone" type="text"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="(00) 00000-0000" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700">
                        Status
                    </label>
                    <select v-model="companyForm.status"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </select>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" @click="showCompanyModal = false"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit"
                        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        :disabled="isSubmitting">
                        <i v-if="isSubmitting" class="fas fa-spinner fa-spin mr-2"></i>
                        {{ isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar' : 'Criar') }}
                    </button>
                </div>
            </form>
        </base-modal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import BaseButton from '../components/common/BaseButton.vue'
import BaseModal from '../components/common/BaseModal.vue'
import { useAuthStore } from '../stores/auth'

const toast = useToast()
const authStore = useAuthStore()

const companies = ref([])
const showCompanyModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const companyForm = ref({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    status: 'active'
})

// Verificar se é admin
if (!authStore.isAdmin) {
    toast.error('Acesso não autorizado')
    router.push('/')
}

const formatCNPJ = (cnpj) => {
    if (!cnpj) return ''
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

const openCreateCompanyModal = () => {
    isEditing.value = false
    companyForm.value = {
        name: '',
        cnpj: '',
        email: '',
        phone: '',
        status: 'active'
    }
    showCompanyModal.value = true
}

const editCompany = (company) => {
    isEditing.value = true
    companyForm.value = { ...company }
    showCompanyModal.value = true
}

const deleteCompany = async (company) => {
    if (!confirm(`Tem certeza que deseja excluir a empresa ${company.name}?`)) {
        return
    }

    try {
        // Aqui você fará a chamada para sua API
        await new Promise(resolve => setTimeout(resolve, 1000))
        companies.value = companies.value.filter(c => c.id !== company.id)
        toast.success('Empresa excluída com sucesso!')
    } catch (error) {
        console.error('Erro ao excluir empresa:', error)
        toast.error('Erro ao excluir empresa')
    }
}

const handleSubmit = async () => {
    try {
        isSubmitting.value = true

        // Aqui você fará a chamada para sua API
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (isEditing.value) {
            // Atualizar empresa existente
            const index = companies.value.findIndex(c => c.id === companyForm.value.id)
            if (index !== -1) {
                companies.value[index] = { ...companyForm.value }
            }
            toast.success('Empresa atualizada com sucesso!')
        } else {
            // Criar nova empresa
            const newCompany = {
                id: companies.value.length + 1,
                ...companyForm.value
            }
            companies.value.push(newCompany)
            toast.success('Empresa criada com sucesso!')
        }

        showCompanyModal.value = false
    } catch (error) {
        console.error('Erro ao salvar empresa:', error)
        toast.error('Erro ao salvar empresa')
    } finally {
        isSubmitting.value = false
    }
}

onMounted(async () => {
    try {
        // Aqui você fará a chamada para sua API
        // Por enquanto, vamos usar dados de exemplo
        companies.value = [
            {
                id: 1,
                name: 'Empresa Exemplo',
                cnpj: '12345678901234',
                email: 'empresa@exemplo.com',
                phone: '11999999999',
                status: 'active'
            }
        ]
    } catch (error) {
        console.error('Erro ao carregar empresas:', error)
        toast.error('Erro ao carregar empresas')
    }
})
</script>