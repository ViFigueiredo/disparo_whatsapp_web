<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="flex w-full bg-white shadow-sm">
      <div class="flex w-full px-4 sm:px-6 lg:px-8">
        <div class="flex w-full h-16">
          <div class="flex w-full justify-between">
            <div class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Disparo Whatsapp Web</h1>
            </div>
            <div class="hidden sm:flex sm:space-x-8">
              <router-link 
                to="/" 
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <i class="fas fa-file-alt mr-2"></i>
                Templates
              </router-link>
              <router-link 
                to="/validation" 
                class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <i class="fas fa-check-circle mr-2"></i>
                Validação
              </router-link>              
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
// Layout padrão da aplicação
</script>