<template>
  <router-view></router-view>
</template>

<script setup>
// Componente raiz da aplicação que serve como ponto de entrada
// e renderiza as rotas através do router-view
</script>

<style>
/* Estilos globais da aplicação */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-color: #0ea5e9;
  --secondary-color: #64748b;
}

body {
  @apply bg-gray-50;
  font-family: 'Inter', sans-serif;
}

.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors;
}

.btn-secondary {
  @apply bg-secondary-600 text-white px-4 py-2 rounded-md hover:bg-secondary-700 transition-colors;
}

.form-input {
  @apply w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500;
}
</style>
