import { computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useUsersStore } from '../stores/users'
import { useCompaniesStore } from '../stores/companies'

export function useUsers() {
    const toast = useToast()
    const usersStore = useUsersStore()
    const companiesStore = useCompaniesStore()

    const users = computed(() => usersStore.formattedUsers)
    const isLoading = computed(() => usersStore.isLoading)
    const error = computed(() => usersStore.error)
    const lastOperation = computed(() => usersStore.lastOperation)
    const companies = computed(() => companiesStore.formattedCompanies)

    const handleError = (error, message) => {
        console.error(message, error)
        toast.error(message + (error.message ? `: ${error.message}` : ''))
        return false
    }

    const fetchUsers = async () => {
        try {
            await usersStore.fetchUsers()
            return true
        } catch (error) {
            return handleError(error, 'Erro ao carregar usuários')
        }
    }

    const fetchCompanies = async () => {
        try {
            await companiesStore.fetchCompanies()
            return true
        } catch (error) {
            return handleError(error, 'Erro ao carregar empresas')
        }
    }

    const createUser = async (userData) => {
        try {
            await usersStore.createUser(userData)
            toast.success('Usuário criado com sucesso!')
            return true
        } catch (error) {
            return handleError(error, 'Erro ao criar usuário')
        }
    }

    const updateUser = async (userData) => {
        try {
            await usersStore.updateUser(userData)
            toast.success('Usuário atualizado com sucesso!')
            return true
        } catch (error) {
            return handleError(error, 'Erro ao atualizar usuário')
        }
    }

    const deleteUser = async (userId) => {
        try {
            await usersStore.deleteUser(userId)
            toast.success('Usuário excluído com sucesso!')
            return true
        } catch (error) {
            return handleError(error, 'Erro ao excluir usuário')
        }
    }

    const resetPassword = async (userId) => {
        try {
            await usersStore.resetPassword(userId)
            toast.success('Senha resetada com sucesso!')
            return true
        } catch (error) {
            return handleError(error, 'Erro ao resetar senha')
        }
    }

    return {
        users,
        companies,
        isLoading,
        error,
        lastOperation,
        fetchUsers,
        fetchCompanies,
        createUser,
        updateUser,
        deleteUser,
        resetPassword
    }
} 