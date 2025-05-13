<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Card de Empresas (apenas para admin) -->
            <dashboard-card
                v-if="authStore.isAdmin"
                title="Empresas"
                description="Gerencie as empresas cadastradas no sistema"
                icon="building"
                icon-color="text-yellow-500"
                color="yellow"
                route="/companies"
                link-text="Ver empresas"
            />
            <!-- Card de Conexões -->
            <dashboard-card
                title="Conexões"
                description="Gerencie suas conexões de WhatsApp"
                icon="plug"
                icon-color="text-blue-500"
                color="blue"
                route="/connections"
                link-text="Ver conexões"
            />
            <!-- Card de Templates -->
            <dashboard-card
                title="Templates"
                description="Gerencie seus templates de mensagens"
                icon="file-alt"
                icon-color="text-green-500"
                color="green"
                route="/templates"
                link-text="Ver templates"
            />
            <!-- Card de Leads -->
            <dashboard-card
                title="Leads"
                description="Gerencie seus leads e contatos"
                icon="users"
                icon-color="text-purple-500"
                color="purple"
                route="/leads"
                link-text="Ver leads"
            />
            <!-- Card de Usuários (apenas para admin) -->
            <dashboard-card
                v-if="authStore.isAdmin"
                title="Usuários"
                description="Gerencie os usuários do sistema"
                icon="user-cog"
                icon-color="text-pink-500"
                color="pink"
                route="/users"
                link-text="Ver usuários"
            />
        </div>
    </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import DashboardCard from '../components/home/DashboardCard.vue'

const authStore = useAuthStore()
</script>