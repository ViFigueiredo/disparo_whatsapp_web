<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900">Empresas</h2>
            <ListFilterSort v-model:search="searchQuery" v-model:sort="sortOrder"
                search-placeholder="Buscar por nome...">
                <base-button @click="openCreateCompanyModal">
                    <i class="fas fa-plus mr-2"></i>
                    Nova Empresa
                </base-button>
            </ListFilterSort>
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
                    <tr v-for="company in filteredCompanies" :key="company.id">
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">{{ company.name }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-500">{{ company.formatted_cnpj }}</div>
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
            <company-form :company="companyForm" :is-editing="isEditing" @submit="handleFormSubmit"
                @cancel="showCompanyModal = false" />
        </base-modal>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import BaseButton from '../components/common/BaseButton.vue'
import BaseModal from '../components/common/BaseModal.vue'
import CompanyForm from '../components/companies/CompanyForm.vue'
import ListFilterSort from '../components/common/ListFilterSort.vue'
import { useAuthStore } from '../stores/auth'
import { useCompaniesStore } from '../stores/companies'

const toast = useToast()
const router = useRouter()
const authStore = useAuthStore()
const companiesStore = useCompaniesStore()

const showCompanyModal = ref(false)
const isEditing = ref(false)
const companyForm = ref({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    status: 'active'
})

const searchQuery = ref('')
const sortOrder = ref('asc')

const filteredCompanies = computed(() => {
    let result = companiesStore.formattedCompanies
    // Filtro de busca
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(company =>
            company.name.toLowerCase().includes(query) ||
            company.email.toLowerCase().includes(query)
        )
    }
    // Ordenação
    return result.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase()
        const nameB = (b.name || '').toLowerCase()
        if (sortOrder.value === 'asc') {
            return nameA.localeCompare(nameB)
        } else {
            return nameB.localeCompare(nameA)
        }
    })
})

// Verificar se é admin
if (!authStore.isAdmin) {
    toast.error('Acesso não autorizado')
    router.push('/')
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
        await companiesStore.deleteCompany(company.id)
        toast.success('Empresa excluída com sucesso!')
    } catch (error) {
        console.error('Erro ao excluir empresa:', error)
        toast.error('Erro ao excluir empresa')
    }
}

const handleFormSubmit = async () => {
    await companiesStore.fetchCompanies()
    showCompanyModal.value = false
}

onMounted(async () => {
    try {
        await companiesStore.fetchCompanies()
    } catch (error) {
        console.error('Erro ao carregar empresas:', error)
        toast.error('Erro ao carregar empresas')
    }
})
</script>