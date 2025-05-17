import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'

const companies = ref([])
const isLoading = ref(false)
const toast = useToast()

export function useCompanies() {
    // Função para buscar todas as empresas
    const fetchCompanies = async () => {
        try {
            isLoading.value = true
            const response = await api.get(webhooks.companies.list)
            companies.value = Array.isArray(response.data) ? response.data : []
        } catch (error) {
            console.error('Erro ao carregar empresas:', error)
            toast.error('Erro ao carregar lista de empresas')
            companies.value = []
        } finally {
            isLoading.value = false
        }
    }

    // Função para buscar uma empresa específica
    // const fetchCompany = async (id) => {
    //     try {
    //         isLoading.value = true
    //         const response = await fetch(`${webhooks.companies.get}/${id}`)

    //         if (!response.ok) {
    //             throw new Error('Erro ao buscar empresa')
    //         }

    //         return await response.json()
    //     } catch (error) {
    //         console.error('Erro ao carregar empresa:', error)
    //         toast.error('Erro ao carregar dados da empresa')
    //         return null
    //     } finally {
    //         isLoading.value = false
    //     }
    // }

    const createCompany = async (companyData) => {
        try {
            await api.post(webhooks.companies.create, companyData)
            toast.success('Empresa criada com sucesso!')
            await fetchCompanies()
            return true
        } catch (error) {
            console.error('Erro ao criar empresa:', error)
            toast.error('Erro ao criar empresa')
            return false
        }
    }

    const updateCompany = async (companyData) => {
        try {
            await api.post(webhooks.companies.update, companyData)
            toast.success('Empresa atualizada com sucesso!')
            await fetchCompanies()
            return true
        } catch (error) {
            console.error('Erro ao atualizar empresa:', error)
            toast.error('Erro ao atualizar empresa')
            return false
        }
    }

    const deleteCompany = async (companyId) => {
        try {
            await api.post(webhooks.companies.delete, { id: companyId })
            toast.success('Empresa excluída com sucesso!')
            await fetchCompanies()
            return true
        } catch (error) {
            console.error('Erro ao excluir empresa:', error)
            toast.error('Erro ao excluir empresa')
            return false
        }
    }

    return {
        companies,
        isLoading,
        fetchCompanies,
        createCompany,
        updateCompany,
        deleteCompany
    }
} 