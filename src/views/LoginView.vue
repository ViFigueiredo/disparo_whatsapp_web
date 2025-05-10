<template>
    <div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Login
            </h2>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <form class="space-y-6" @submit.prevent="handleLogin">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <div class="mt-1">
                            <input id="email" v-model="email" type="email" required
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">
                            Senha
                        </label>
                        <div class="mt-1">
                            <input id="password" v-model="password" type="password" required
                                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
                        <div class="text-sm">
                            <a href="#" @click.prevent="showForgotPassword = true"
                                class="font-medium text-blue-600 hover:text-blue-500">
                                Esqueceu sua senha?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button type="submit" :disabled="isLoading"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <i v-if="isLoading" class="fas fa-spinner fa-spin mr-2"></i>
                            {{ isLoading ? 'Entrando...' : 'Entrar' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal de Recuperação de Senha -->
        <base-modal v-model="showForgotPassword" title="Recuperar Senha">
            <form @submit.prevent="handleForgotPassword" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input v-model="recoveryEmail" type="email" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Digite seu email" />
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button type="button" @click="showForgotPassword = false"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit"
                        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        :disabled="isRecovering">
                        <i v-if="isRecovering" class="fas fa-spinner fa-spin mr-2"></i>
                        {{ isRecovering ? 'Enviando...' : 'Enviar' }}
                    </button>
                </div>
            </form>
        </base-modal>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import BaseModal from '../components/common/BaseModal.vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showForgotPassword = ref(false)
const recoveryEmail = ref('')
const isRecovering = ref(false)

// Credenciais padrão do admin
const ADMIN_EMAIL = 'admin@admin.com'
const ADMIN_PASSWORD = 'admin123'

const handleLogin = async () => {
    try {
        isLoading.value = true

        // Verificar credenciais padrão
        if (email.value === ADMIN_EMAIL && password.value === ADMIN_PASSWORD) {
            await authStore.login({ email: email.value, password: password.value })
            toast.success('Login realizado com sucesso!')
            router.push('/')
        } else {
            toast.error('Email ou senha inválidos')
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error)
        toast.error('Erro ao fazer login')
    } finally {
        isLoading.value = false
    }
}

const handleForgotPassword = async () => {
    try {
        isRecovering.value = true

        // Simular envio de email de recuperação
        await new Promise(resolve => setTimeout(resolve, 1000))

        toast.success('Email de recuperação enviado com sucesso!')
        showForgotPassword.value = false
    } catch (error) {
        console.error('Erro ao enviar email de recuperação:', error)
        toast.error('Erro ao enviar email de recuperação')
    } finally {
        isRecovering.value = false
    }
}
</script>