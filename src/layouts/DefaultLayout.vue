<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Barra de navegação -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-blue-600">WhatsApp Web</h1>
            </div>

            <!-- Links de navegação -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link to="/" class="inline-flex items-center px-1 pt-1 border-b-2"
                :class="[$route.path === '/' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']">
                Dashboard
              </router-link>
              <router-link v-if="authStore.isAdmin" to="/companies"
                class="inline-flex items-center px-1 pt-1 border-b-2"
                :class="[$route.path === '/companies' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']">
                Empresas
              </router-link>
              <router-link v-if="authStore.isAdmin" to="/users" class="inline-flex items-center px-1 pt-1 border-b-2"
                :class="[$route.path === '/users' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']">
                Usuários
              </router-link>
              <router-link to="/connections" class="inline-flex items-center px-1 pt-1 border-b-2"
                :class="[$route.path === '/connections' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']">
                Conexões
              </router-link>
              <router-link to="/templates" class="inline-flex items-center px-1 pt-1 border-b-2"
                :class="[$route.path === '/templates' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']">
                Templates
              </router-link>
              <router-link to="/leads" class="inline-flex items-center px-1 pt-1 border-b-2"
                :class="[$route.path === '/leads' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']">
                Leads
              </router-link>
            </div>
          </div>

          <!-- Menu do usuário -->
          <div class="flex items-center">
            <div class="ml-3 relative">
              <div class="flex items-center space-x-4">
                <div class="text-sm text-gray-700">
                  <div>{{ authStore.user?.name }}</div>
                  <div v-if="authStore.company" class="text-xs text-gray-500">
                    {{ authStore.company.name }}
                  </div>
                </div>
                <button @click="handleLogout"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <i class="fas fa-sign-out-alt mr-2"></i>
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Conteúdo principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  toast.success('Logout realizado com sucesso!')
  router.push('/login')
}
</script>