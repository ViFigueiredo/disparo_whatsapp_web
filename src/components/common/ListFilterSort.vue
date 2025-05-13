<template>
    <div class="flex space-x-3 items-center">
        <div class="relative">
            <input :placeholder="searchPlaceholder" v-model="localSearch" @input="$emit('update:search', localSearch)"
                type="text"
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
        <select v-model="localSort" @change="$emit('update:sort', localSort)"
            class="py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="asc">Nome (A-Z)</option>
            <option value="desc">Nome (Z-A)</option>
        </select>
        <slot></slot>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    search: {
        type: String,
        default: ''
    },
    sort: {
        type: String,
        default: 'asc'
    },
    searchPlaceholder: {
        type: String,
        default: 'Buscar...'
    }
})

const localSearch = ref(props.search)
const localSort = ref(props.sort)

watch(() => props.search, (val) => {
    localSearch.value = val
})
watch(() => props.sort, (val) => {
    localSort.value = val
})
</script>