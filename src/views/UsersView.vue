<template>
    <div class="space-y-6">
        <UsersHeader :users="validUsers" @new-user="openCreateUserModal" />

        <!-- Lista de Usuários -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Empresa</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Papel
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="user in validUsers" :key="user.id">
                        <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{{ companyName(user.company_id) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">{{ user.role === 'admin' ? 'Administrador' : 'Usuário'
                        }}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="[
                                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            ]">
                                {{ user.status === 'active' ? 'Ativo' : 'Inativo' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button @click="editUser(user)" class="text-blue-600 hover:text-blue-900 mr-4">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button @click="deleteUser(user)" class="text-red-600 hover:text-red-900">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal de Criação/Edição de Usuário -->
        <base-modal v-model="showUserModal" :title="isEditing ? 'Editar Usuário' : 'Novo Usuário'">
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Nome</label>
                    <input v-model="userForm.name" type="text" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input v-model="userForm.email" type="email" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div v-if="!isEditing">
                    <label class="block text-sm font-medium text-gray-700">Senha</label>
                    <input v-model="userForm.password" type="password" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Empresa</label>
                    <select v-model="userForm.company_id" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="" disabled>Selecione a empresa</option>
                        <option v-for="company in validCompanies" :key="company.id" :value="company.id">{{ company.name
                        }}
                        </option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Papel</label>
                    <select v-model="userForm.role" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="user">Usuário</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" @click="showUserModal = false"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
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
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import BaseButton from '../components/common/BaseButton.vue'
import BaseModal from '../components/common/BaseModal.vue'
import axios from 'axios'
import UsersHeader from '../components/users/UsersHeader.vue'

const toast = useToast()
const users = ref([])
const companies = ref([])
const showUserModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const userForm = ref({
    name: '',
    email: '',
    password: '',
    company_id: '',
    role: 'user',
    status: 'active'
})

// Computed property para filtrar usuários válidos
const validUsers = computed(() => {
    return users.value.filter(user =>
        user && Object.keys(user).length > 0 && user.name && user.email
    )
})

// Computed property para filtrar empresas válidas
const validCompanies = computed(() => {
    return companies.value.filter(company =>
        company && Object.keys(company).length > 0 && company.name
    )
})

const companyName = (id) => {
    const c = companies.value.find(c => String(c.id) === String(id))
    return c ? c.name : 'N/A'
}

const fetchUsers = async () => {
    try {
        const response = await axios.get(import.meta.env.VITE_WEBHOOK_USERS_LIST)
        users.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
        users.value = []
        toast.error('Erro ao carregar usuários')
    }
}

const fetchCompanies = async () => {
    try {
        const response = await axios.get(import.meta.env.VITE_WEBHOOK_COMPANIES_LIST)
        companies.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
        companies.value = []
        toast.error('Erro ao carregar empresas')
    }
}

const openCreateUserModal = async () => {
    isEditing.value = false
    userForm.value = {
        name: '',
        email: '',
        password: '',
        company_id: '',
        role: 'user',
        status: 'active'
    }
    showUserModal.value = true
    if (!companies.value.length) await fetchCompanies()
}

const editUser = async (user) => {
    isEditing.value = true
    userForm.value = { ...user, password: '' }
    showUserModal.value = true
    if (!companies.value.length) await fetchCompanies()
}

const deleteUser = async (user) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) return
    try {
        await axios.post(import.meta.env.VITE_WEBHOOK_USERS_DELETE, { id: user.id })
        toast.success('Usuário excluído com sucesso!')
        await fetchUsers()
    } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        toast.error('Erro ao excluir usuário')
    }
}

const handleSubmit = async () => {
    isSubmitting.value = true
    try {
        if (isEditing.value) {
            const userData = {
                id: userForm.value.id,
                name: userForm.value.name,
                email: userForm.value.email,
                company_id: userForm.value.company_id,
                role: userForm.value.role,
                status: userForm.value.status
            }
            await axios.post(import.meta.env.VITE_WEBHOOK_USERS_UPDATE, userData)
            toast.success('Usuário atualizado com sucesso!')
            showUserModal.value = false
            await fetchUsers()
        } else {
            const response = await axios.post(import.meta.env.VITE_WEBHOOK_USERS_CREATE, userForm.value)
            if (response.data) {
                toast.success('Usuário criado com sucesso!')
                showUserModal.value = false
                users.value = [...users.value, response.data]
                await fetchUsers()
            }
        }
    } catch (error) {
        console.error('Erro ao salvar usuário:', error)
        toast.error('Erro ao salvar usuário')
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    fetchUsers()
    fetchCompanies()
})
</script>