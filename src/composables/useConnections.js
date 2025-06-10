import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useConnectionStore } from '../stores/connection'
import { useCompaniesStore } from '../stores/companies'
import { useAuthStore } from '../stores/auth'
import api from '../config/axios'
import { webhooks } from '../config/webhooks'

export function useConnections() {
  const toast = useToast()
  const connectionStore = useConnectionStore()
  const companiesStore = useCompaniesStore()
  const authStore = useAuthStore()

  const connections = computed(() => connectionStore.connections)
  const isLoading = computed(() => connectionStore.isLoading)
  const error = computed(() => connectionStore.error)
  const companyConnections = ref([])

  const connectionsWithCompanies = computed(() => {
    return connections.value.map(connection => {
      const connectionLink = companyConnections.value.find(
        link => String(link.connection_id) === String(connection.id)
      )
      
      let companyName = 'N/A'
      if (connectionLink) {
        const company = companiesStore.companies.find(
          c => String(c.id) === String(connectionLink.company_id)
        )
        if (company) {
          companyName = company.name
        }
      }

      return {
        ...connection,
        companyName
      }
    })
  })

  const handleError = (error, message) => {
    console.error(message, error)
    toast.error(message + (error.message ? `: ${error.message}` : ''))
    return false
  }

  const fetchCompanyConnections = async () => {
    try {
      const response = await api.get(webhooks.companiesConnections.list)
      const connections = response.data.companiesConnections || []
      companyConnections.value = Array.isArray(connections) ? connections : []
      
      if (companyConnections.value.length === 0) {
        toast.warning('Nenhuma conexão de empresa encontrada.')
      }
      return true
    } catch (error) {
      companyConnections.value = []
      return handleError(error, 'Erro ao buscar conexões da empresa')
    }
  }

  const fetchConnections = async () => {
    try {
      await companiesStore.fetchCompanies()
      await connectionStore.fetchConnections()
      await fetchCompanyConnections()

      if (authStore.isAdmin && 
          connections.value.length > 0 && 
          connections.value.some(conn => !conn.companyId)) {
        toast.warning('Existem conexões sem empresa vinculada.')
      }
      return true
    } catch (error) {
      return handleError(error, 'Erro ao carregar conexões')
    }
  }

  const createConnection = async (connectionData) => {
    try {
      if (!authStore.isAdmin) {
        connectionData.company_id = authStore.user.company_id
      }

      const evolutionResponse = await api.post(webhooks.connections.create, {
        name: connectionData.name,
        company_id: connectionData.company_id
      })

      const responseData = Array.isArray(evolutionResponse.data) ? evolutionResponse.data[0] : evolutionResponse.data

      if (!responseData) {
        throw new Error('Resposta inválida da API')
      }

      const connectionId = responseData.id || responseData.connection_id || responseData.connectionId
      if (!connectionId) {
        throw new Error('ID da conexão não retornado pela Evolution API')
      }

      if (connectionData.company_id) {
        await api.post(webhooks.companiesConnections.create, {
          company_id: connectionData.company_id,
          connection_id: connectionId
        })
      }

      toast.success('Conexão criada e vinculada à empresa com sucesso!')
      await fetchConnections()
      return true
    } catch (error) {
      return handleError(error, 'Erro ao criar conexão')
    }
  }

  const updateConnectionCompany = async (connectionData) => {
    try {
      const currentConnection = connections.value.find(conn =>
        String(conn.id) === String(connectionData.id)
      )

      if (!currentConnection) {
        throw new Error('Conexão não encontrada')
      }

      const evolutionConnectionId = currentConnection.connection_id ||
        currentConnection.connectionId ||
        currentConnection.instanceId ||
        currentConnection.instance_id ||
        currentConnection.id

      if (!evolutionConnectionId) {
        throw new Error('ID da Evolution não encontrado na conexão')
      }

      await api.post(webhooks.companiesConnections.create, {
        company_id: connectionData.company_id,
        connection_id: evolutionConnectionId
      })

      await new Promise(resolve => setTimeout(resolve, 300))
      await fetchConnections()

      toast.success('Empresa da conexão atualizada com sucesso!')
      return true
    } catch (error) {
      return handleError(error, 'Erro ao atualizar empresa da conexão')
    }
  }

  const getCompanyNameForConnection = (connection) => {
    if (!connection) return 'N/A'
    
    const connectionWithCompany = connectionsWithCompanies.value.find(
      conn => String(conn.id) === String(connection.id)
    )
    
    return connectionWithCompany ? connectionWithCompany.companyName : 'N/A'
  }

  return {
    connections,
    isLoading,
    error,
    companyConnections,
    fetchCompanyConnections,
    fetchConnections,
    createConnection,
    updateConnectionCompany,
    getCompanyNameForConnection,
    connectionsWithCompanies
  }
} 