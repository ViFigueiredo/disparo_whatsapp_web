<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="flex w-full bg-white shadow-sm">
      <div class="flex w-full px-4 sm:px-6 lg:px-8">
        <div class="flex w-full h-16">
          <div class="flex w-full justify-between">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Figcodes</h1>
            </div>
            <div class="hidden sm:flex sm:space-x-8">
              <!-- <router-link to=""
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <i class="fas fa-robot mr-2"></i>
                Agentes IA
              </router-link>

              <router-link to=""
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <i class="fas fa-bolt mr-2"></i>
                Automações
              </router-link> -->

              <!-- <router-link to=""
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <i class="fas fa-chart-bar mr-2"></i>
                Relatórios
              </router-link>

              <router-link to=""
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <i class="fab fa-whatsapp mr-2"></i>
                Instâncias
              </router-link> -->

              <router-link to="/"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <i class="fas fa-file-signature mr-2"></i>
                Templates
              </router-link>

              <router-link to="/leads"
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <i class="fas fa-users mr-2"></i>
                Clientes
              </router-link>
            </div>

            <!-- Avatar Menu Dropdown -->
            <!-- <div class="ml-4 flex items-center md:ml-6"> -->
            <div class="flex items-center">
              <div class="relative">
                <a href="#" class="block px-4 py-2 text-lg text-gray-700 hover:bg-gray-100">
                  <i class="fas fa-sign-out-alt"></i>
                </a>
                <!-- <button @click="toggleDropdown" class="flex items-center space-x-2 focus:outline-none">
                  <div
                    class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                    {{ userInitials }}
                  </div> -->
                  <!-- <span class="hidden md:block text-sm font-medium text-gray-700">{{ userName }}</span>
                  <i :class="{ 'transform rotate-180': dropdownOpen }"
                    class="fas fa-chevron-down text-gray-400 transition-transform duration-200"></i> -->
                <!-- </button> -->

                <!-- Dropdown Menu com v-click-outside -->
                <!-- <div v-if="dropdownOpen" v-click-outside="closeDropdown"
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"> -->
                  <!-- <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class="fas fa-user mr-2"></i> Meu Perfil
                  </a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class="fas fa-cog mr-2"></i> Configurações
                  </a> -->
                  <!-- <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <i class="fas fa-sign-out-alt mr-2"></i> Sair
                  </a> -->
                <!-- </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const dropdownOpen = ref(false);
const userName = 'Admin User'; // Substitua pelo nome do usuário real
const userEmail = 'admin@pyzapbot.com'; // Substitua pelo email do usuário real

const userInitials = computed(() => {
  return userName
    .split(' ')
    .slice(0, 2) // Pega apenas as duas primeiras palavras para as iniciais
    .map(name => name[0])
    .join('')
    .toUpperCase();
});

// Diretiva personalizada para detectar clique fora
const vClickOutside = {
  mounted(el, binding) {  // Alterado de beforeMount para mounted
    el._clickOutsideHandler = (event) => {  // Adicionado prefixo _ para propriedade privada
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    // Adicionado delay para evitar fechamento imediato
    setTimeout(() => document.addEventListener('click', el._clickOutsideHandler), 0);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutsideHandler);
  }
};

const toggleDropdown = (event) => {
  event.stopPropagation(); // Previne a propagação do evento
  dropdownOpen.value = !dropdownOpen.value;
};

const closeDropdown = () => {
  dropdownOpen.value = false;
};
</script>