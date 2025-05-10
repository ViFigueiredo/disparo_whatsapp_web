<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Card de Conexões -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium text-gray-900">Conexões</h3>
                    <i class="fas fa-plug text-blue-500 text-2xl"></i>
                </div>
                <p class="mt-2 text-sm text-gray-500">
                    Gerencie suas conexões de WhatsApp
                </p>
                <router-link to="/connections"
                    class="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                    Ver conexões
                    <i class="fas fa-arrow-right ml-2"></i>
                </router-link>
            </div>

            <!-- Card de Templates -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium text-gray-900">Templates</h3>
                    <i class="fas fa-file-alt text-green-500 text-2xl"></i>
                </div>
                <p class="mt-2 text-sm text-gray-500">
                    Gerencie seus templates de mensagens
                </p>
                <router-link to="/templates"
                    class="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                    Ver templates
                    <i class="fas fa-arrow-right ml-2"></i>
                </router-link>
            </div>

            <!-- Card de Leads -->
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-medium text-gray-900">Leads</h3>
                    <i class="fas fa-users text-purple-500 text-2xl"></i>
                </div>
                <p class="mt-2 text-sm text-gray-500">
                    Gerencie seus leads e contatos
                </p>
                <router-link to="/leads"
                    class="mt-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                    Ver leads
                    <i class="fas fa-arrow-right ml-2"></i>
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>