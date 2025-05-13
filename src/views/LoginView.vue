<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Faça login em sua conta
                </h2>
            </div>

            <login-form
                v-model:email="email"
                v-model:password="password"
                :is-loading="isLoading"
                @submit="handleSubmit"
                @forgot-password="handleForgotPassword"
            />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
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

const handleSubmit = async () => {
    isLoading.value = true
    try {
        await authStore.login(email.value, password.value)
        router.push('/')
    } catch (error) {
        console.error('Erro no login:', error)
        toast.error('Email ou senha inválidos')
    } finally {
        isLoading.value = false
    }
}

const handleForgotPassword = () => {
    toast.info('Funcionalidade em desenvolvimento')
}
</script>