import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useConnectionStore } from '../stores/connection'
import { useCompaniesStore } from '../stores/companies'
import axios from 'axios'

export function useConnections() {
  const toast = useToast()
  const connectionStore = useConnectionStore()
  const companiesStore = useCompaniesStore()

  const connections = ref([])
  const isLoading = ref(false)
  const companyConnections = ref([])

  // Fetch functions
  const fetchCompanyConnections = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_WEBHOOK_COMPANIES_CONNECTIONS_LIST)
      companyConnections.value = Array.isArray(response.data) ? response.data : []
    } catch (error) {
      companyConnections.value = []
    }
  }

  const fetchConnections = async () => {
    try {
      isLoading.value = true
      await companiesStore.fetchCompanies()
      await connectionStore.fetchConnections()
      connections.value = connectionStore.connections
      await fetchCompanyConnections()
    } catch (error) {
      console.error('Erro ao carregar conexões:', error)
      toast.error('Erro ao carregar conexões')
    } finally {
      isLoading.value = false
    }
  }

  // Connection operations
  const createConnection = async (connectionData) => {
    try {
      // 1. Criar conexão na Evolution API
      const evolutionResponse = await axios.post(import.meta.env.VITE_WEBHOOK_CONNECTIONS_CREATE, {
        name: connectionData.name,
        company_id: connectionData.company_id
      })

      const connectionId = evolutionResponse.data.id || evolutionResponse.data.connection_id || evolutionResponse.data.connectionId
      if (!connectionId) throw new Error('ID da conexão não retornado pela Evolution API')

      // 2. Relacionar conexão à empresa no banco local
      await axios.post(import.meta.env.VITE_WEBHOOK_COMPANIES_CONNECTIONS_CREATE, {
        company_id: connectionData.company_id,
        connection_id: connectionId
      })

      toast.success('Conexão criada e vinculada à empresa com sucesso!')
      await fetchConnections()
      return true
    } catch (error) {
      console.error('Erro ao criar conexão:', error)
      toast.error('Erro ao criar conexão: ' + (error.message || 'Erro desconhecido'))
      return false
    }
  }

  const updateConnectionCompany = async (connectionData) => {
    try {
      await axios.post(import.meta.env.VITE_WEBHOOK_COMPANIES_CONNECTIONS_UPDATE, {
        company_id: connectionData.company_id,
        connection_id: connectionData.id
      })

      toast.success('Empresa da conexão atualizada com sucesso!')
      await fetchConnections()
      return true
    } catch (error) {
      console.error('Erro ao atualizar empresa da conexão:', error)
      toast.error('Erro ao atualizar empresa da conexão: ' + (error.message || 'Erro desconhecido'))
      return false
    }
  }

  const getCompanyNameForConnection = (connectionId) => {
    const rel = companyConnections.value.find(
      c => String(c.connection_id).trim() === String(connectionId).trim()
    )
    if (!rel) return 'N/A'
    const company = companiesStore.companies.find(
      c => String(c.id) === String(rel.company_id)
    )
    return company ? company.name : 'N/A'
  }

  return {
    connections,
    isLoading,
    companyConnections,
    fetchConnections,
    createConnection,
    updateConnectionCompany,
    getCompanyNameForConnection
  }
} 