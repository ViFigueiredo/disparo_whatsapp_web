<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <img src="/logo.png" alt="Logo do Sistema" class="mx-auto w-auto max-h-64 object-contain" />
                <p class="mt-6 text-center text-sm text-gray-600">
                    Faça login em sua conta
                </p>
            </div>

            <login-form v-model:email="email" v-model:password="password" :is-loading="isLoading" :error="error"
                @submit="handleSubmit" @forgot-password="handleForgotPassword" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'
import LoginForm from '../components/auth/LoginForm.vue'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const appTitle = computed(() => import.meta.env.VITE_APP_TITLE)

const handleSubmit = async () => {
    if (!email.value || !password.value) {
        error.value = 'Por favor, preencha todos os campos'
        return
    }

    isLoading.value = true
    error.value = ''

    try {
        await authStore.login(email.value, password.value)
        toast.success('Login realizado com sucesso!')
        router.push('/')
    } catch (error) {
        console.error('Erro no login:', error)
        if (error.response?.status === 401) {
            error.value = 'Email ou senha inválidos'
        } else if (error.response?.status === 403) {
            error.value = 'Acesso negado. Verifique suas credenciais.'
        } else {
            error.value = 'Erro ao fazer login. Tente novamente mais tarde.'
        }
        toast.error(error.value)
    } finally {
        isLoading.value = false
    }
}

const handleForgotPassword = () => {
    toast.info('Funcionalidade em desenvolvimento')
}
</script>