import { computed } from 'vue'
import { useCompaniesStore } from '../stores/companies'
import { useToast } from 'vue-toastification'

export function useCompanies() {
    const companiesStore = useCompaniesStore()
    const toast = useToast()

    const companies = computed(() => companiesStore.companies)
    const isLoading = computed(() => companiesStore.loading)
    const error = computed(() => companiesStore.error)

    const fetchCompanies = async () => {
        try {
            await companiesStore.fetchCompanies()
        } catch (error) {
            toast.error('Erro ao carregar lista de empresas')
            throw error
        }
    }

    const createCompany = async (companyData) => {
        try {
            await companiesStore.createCompany(companyData)
            toast.success('Empresa criada com sucesso!')
            return true
        } catch (error) {
            toast.error('Erro ao criar empresa')
            return false
        }
    }

    const updateCompany = async (companyData) => {
        try {
            await companiesStore.updateCompany(companyData)
            toast.success('Empresa atualizada com sucesso!')
            return true
        } catch (error) {
            toast.error('Erro ao atualizar empresa')
            return false
        }
    }

    const deleteCompany = async (companyId) => {
        try {
            await companiesStore.deleteCompany(companyId)
            toast.success('Empresa excluída com sucesso!')
            return true
        } catch (error) {
            toast.error('Erro ao excluir empresa')
            return false
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
        fetchCompanies,
        createCompany,
        updateCompany,
        deleteCompany,
        formatCNPJ
    }
} 