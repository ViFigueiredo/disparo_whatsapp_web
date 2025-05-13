<template>
    <div class="space-y-6">
        <loading-overlay v-if="companiesStore.loading" message="Carregando empresas..." />

        <companies-header
            v-model:search="searchQuery"
            v-model:sort="sortOrder"
            @new-company="openCreateCompanyModal"
        />

        <company-table
            :companies="filteredCompanies"
            @edit="editCompany"
            @delete="deleteCompany"
        />

        <!-- Modal de Criação/Edição de Empresa -->
        <base-modal v-model="showCompanyModal" :title="isEditing ? 'Editar Empresa' : 'Nova Empresa'">
            <company-form
                :company="companyForm"
                :is-editing="isEditing"
                :is-submitting="isSubmitting"
                @update:company="updateCompanyForm"
                @submit="handleFormSubmit"
                @cancel="showCompanyModal = false"
            />
        </base-modal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCompaniesStore } from '../stores/companies'

// Components
import BaseModal from '../components/common/BaseModal.vue'
import CompanyForm from '../components/companies/CompanyForm.vue'
import CompaniesHeader from '../components/companies/CompaniesHeader.vue'
import CompanyTable from '../components/companies/CompanyTable.vue'
import LoadingOverlay from '../components/common/LoadingOverlay.vue'

// Router and Stores
const router = useRouter()
const authStore = useAuthStore()
const companiesStore = useCompaniesStore()

// State
const showCompanyModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const searchQuery = ref('')
const sortOrder = ref('asc')
const companyForm = ref({
    id: undefined,
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    status: 'active'
})

// Computed
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

// Methods
const updateCompanyForm = (newData) => {
    companyForm.value = { ...newData }
}

const openCreateCompanyModal = () => {
    isEditing.value = false
    companyForm.value = {
        id: undefined,
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
        // Atualiza a lista de empresas após o sucesso da deleção
        await companiesStore.fetchCompanies()
    } catch (error) {
        console.error('Erro ao excluir empresa:', error)
    }
}

const handleFormSubmit = async (formData) => {
    isSubmitting.value = true
    try {
        if (isEditing.value) {
            await companiesStore.updateCompany(formData)
        } else {
            await companiesStore.createCompany(formData)
        }
        showCompanyModal.value = false
        await companiesStore.fetchCompanies()
    } finally {
        isSubmitting.value = false
    }
}

// Lifecycle
onMounted(async () => {
    // Verificar se é admin
    if (!authStore.isAdmin) {
        router.push('/')
        return
    }
    
    await companiesStore.fetchCompanies()
})
</script>