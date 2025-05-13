import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import axios from 'axios'

export function useUsers() {
    const toast = useToast()
    const users = ref([])
    const companies = ref([])
    const isLoading = ref(false)

    const fetchUsers = async () => {
        try {
            isLoading.value = true
            const response = await axios.get(import.meta.env.VITE_WEBHOOK_USERS_LIST)
            users.value = Array.isArray(response.data) ? response.data : []
        } catch (error) {
            console.error('Erro ao carregar usuários:', error)
            toast.error('Erro ao carregar usuários')
            users.value = []
        } finally {
            isLoading.value = false
        }
    }

    const fetchCompanies = async () => {
        try {
            isLoading.value = true
            const response = await axios.get(import.meta.env.VITE_WEBHOOK_COMPANIES_LIST)
            companies.value = Array.isArray(response.data) ? response.data : []
        } catch (error) {
            console.error('Erro ao carregar empresas:', error)
            toast.error('Erro ao carregar empresas')
            companies.value = []
        } finally {
            isLoading.value = false
        }
    }

    const createUser = async (userData) => {
        try {
            isLoading.value = true
            await axios.post(import.meta.env.VITE_WEBHOOK_USERS_CREATE, userData)
            toast.success('Usuário criado com sucesso!')
            await fetchUsers()
            return true
        } catch (error) {
            console.error('Erro ao criar usuário:', error)
            toast.error('Erro ao criar usuário')
            return false
        } finally {
            isLoading.value = false
        }
    }

    const updateUser = async (userData) => {
        try {
            isLoading.value = true
            await axios.post(import.meta.env.VITE_WEBHOOK_USERS_UPDATE, userData)
            toast.success('Usuário atualizado com sucesso!')
            await fetchUsers()
            return true
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error)
            toast.error('Erro ao atualizar usuário')
            return false
        } finally {
            isLoading.value = false
        }
    }

    const deleteUser = async (userId) => {
        try {
            isLoading.value = true
            await axios.post(import.meta.env.VITE_WEBHOOK_USERS_DELETE, { id: userId })
            toast.success('Usuário excluído com sucesso!')
            await fetchUsers()
            return true
        } catch (error) {
            console.error('Erro ao excluir usuário:', error)
            toast.error('Erro ao excluir usuário')
            return false
        } finally {
            isLoading.value = false
        }
    }

    return {
        users,
        companies,
        isLoading,
        fetchUsers,
        fetchCompanies,
        createUser,
        updateUser,
        deleteUser
    }
} 