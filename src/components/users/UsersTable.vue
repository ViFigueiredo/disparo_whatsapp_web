<template>
  <div class="bg-white shadow rounded-lg overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Papel</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="user in users" :key="user.id">
          <td class="px-6 py-4 whitespace-nowrap">{{ user.name }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ user.email }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ getCompanyName(user.company_id) }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ user.role === 'admin' ? 'Administrador' : 'Usuário' }}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span :class="[
              'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            ]">
              {{ user.status === 'active' ? 'Ativo' : 'Inativo' }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button @click="$emit('edit', user)" class="text-blue-600 hover:text-blue-900 mr-4">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="$emit('delete', user)" class="text-red-600 hover:text-red-900">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  users: {
    type: Array,
    required: true
  },
  companies: {
    type: Array,
    required: true
  }
})

defineEmits(['edit', 'delete'])

const getCompanyName = (id) => {
  const company = companies.value.find(c => String(c.id) === String(id))
  return company ? company.name : 'N/A'
}
</script> 