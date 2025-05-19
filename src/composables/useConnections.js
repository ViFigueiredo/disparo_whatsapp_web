import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useConnectionStore } from '../stores/connection'
import { useCompaniesStore } from '../stores/companies'
import api from '../config/axios'
import { webhooks } from '../config/webhooks'

export function useConnections() {
  const toast = useToast()
  const connectionStore = useConnectionStore()
  const companiesStore = useCompaniesStore()

  const connections = computed(() => connectionStore.connections)
  const isLoading = computed(() => connectionStore.isLoading)
  const error = computed(() => connectionStore.error)
  const companyConnections = ref([])

  // Fetch functions
  const fetchCompanyConnections = async () => {
    try {
      const response = await api.get(webhooks.companiesConnections.list)
      companyConnections.value = Array.isArray(response.data) ? response.data : []
      if (
        companyConnections.value.length === 0 ||
        companyConnections.value.every(obj => Object.keys(obj).length === 0)
      ) {
        toast.warning('Nenhuma conexão de empresa encontrada.')
      }
    } catch (error) {
      console.error('Erro ao buscar conexões da empresa:', error)
      companyConnections.value = []
      toast.error('Erro ao buscar conexões da empresa')
    }
  }

  const fetchConnections = async () => {
    try {
      await companiesStore.fetchCompanies()
      await connectionStore.fetchConnections()
      if (
        connections.value.length > 0 &&
        connections.value.some(conn => !conn.companyId)
      ) {
        toast.warning('Existem conexões sem empresa vinculada.')
      }
    } catch (error) {
      console.error('Erro ao carregar conexões:', error)
      toast.error('Erro ao carregar conexões')
    }
  }

  // Connection operations
  const createConnection = async (connectionData) => {
    try {
      // 1. Criar conexão na Evolution API
      const evolutionResponse = await api.post(webhooks.connections.create, {
        name: connectionData.name,
        company_id: connectionData.company_id
      })

      // Corrigir para tratar array ou objeto
      const responseData = Array.isArray(evolutionResponse.data) ? evolutionResponse.data[0] : evolutionResponse.data;

      if (!responseData) {
        throw new Error('Resposta inválida da API');
      }

      const connectionId = responseData.id || responseData.connection_id || responseData.connectionId;
      if (!connectionId) {
        console.warn('Nenhum campo de ID encontrado na resposta:', responseData);
        throw new Error('ID da conexão não retornado pela Evolution API');
      }

      // 2. Vincular à empresa se houver company_id
      if (connectionData.company_id) {
        await api.post(webhooks.companiesConnections.create, {
          company_id: connectionData.company_id,
          connection_id: connectionId
        });
      }

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
      // Encontrar a conexão atual para obter o connection_id da Evolution
      const currentConnection = connections.value.find(conn =>
        String(conn.id) === String(connectionData.id)
      )

      if (!currentConnection) {
        console.error('Conexão não encontrada. ID buscado:', connectionData.id)
        throw new Error('Conexão não encontrada')
      }

      // Tentar encontrar o ID da Evolution em diferentes campos possíveis
      const evolutionConnectionId = currentConnection.connection_id ||
        currentConnection.connectionId ||
        currentConnection.instanceId ||
        currentConnection.instance_id ||
        currentConnection.id

      if (!evolutionConnectionId) {
        console.error('ID da Evolution não encontrado na conexão:', currentConnection)
        throw new Error('ID da Evolution não encontrado na conexão')
      }

      await api.post(webhooks.companiesConnections.create, {
        company_id: connectionData.company_id,
        connection_id: evolutionConnectionId
      })

      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchConnections()

      toast.success('Empresa da conexão atualizada com sucesso!')
      return true
    } catch (error) {
      console.error('Erro ao atualizar empresa da conexão:', error)
      toast.error('Erro ao atualizar empresa da conexão: ' + (error.message || 'Erro desconhecido'))
      return false
    }
  }

  const getCompanyNameForConnection = (connection) => {
    if (!connection || !connection.companyId) return 'N/A'
    const company = companiesStore.companies.find(
      c => String(c.id) === String(connection.companyId)
    )
    return company ? company.name : 'N/A'
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
    getCompanyNameForConnection
  }
}