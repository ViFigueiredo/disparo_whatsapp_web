import { computed } from 'vue'
import { useCompaniesStore } from '../stores/companies'
import { useToast } from 'vue-toastification'

export function useCompanies() {
    const companiesStore = useCompaniesStore()
    const toast = useToast()

    const companies = computed(() => companiesStore.formattedCompanies)
    const isLoading = computed(() => companiesStore.loading)
    const error = computed(() => companiesStore.error)
    const lastOperation = computed(() => companiesStore.lastOperation)

    const handleError = (error, message) => {
        console.error(message, error)
        toast.error(message)
        return false
    }

    const fetchCompanies = async () => {
        try {
            await companiesStore.fetchCompanies()
            return true
        } catch (error) {
            return handleError(error, 'Erro ao carregar lista de empresas')
        }
    }

    const createCompany = async (companyData) => {
        try {
            await companiesStore.createCompany(companyData)
            toast.success('Empresa criada com sucesso!')
            return true
        } catch (error) {
            return handleError(error, 'Erro ao criar empresa')
        }
    }

    const updateCompany = async (companyData) => {
        try {
            await companiesStore.updateCompany(companyData)
            toast.success('Empresa atualizada com sucesso!')
            return true
        } catch (error) {
            return handleError(error, 'Erro ao atualizar empresa')
        }
    }

    const deleteCompany = async (companyId) => {
        try {
            await companiesStore.deleteCompany(companyId)
            toast.success('Empresa excluída com sucesso!')
            return true
        } catch (error) {
            return handleError(error, 'Erro ao excluir empresa')
        }
    }

    const formatCNPJ = (cnpj) => {
        if (!cnpj) return ''
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }

    return {
        companies,
        isLoading,
        error,
        lastOperation,
        fetchCompanies,
        createCompany,
        updateCompany,
        deleteCompany,
        formatCNPJ
    }
} 