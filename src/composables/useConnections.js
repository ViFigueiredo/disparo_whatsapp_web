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

  const connections = ref([])
  const isLoading = ref(false)
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
      companyConnections.value = []
    }
  }

  const fetchConnections = async () => {
    try {
      isLoading.value = true
      console.log('Iniciando fetchCompanies')
      await companiesStore.fetchCompanies()
      console.log('Finalizou fetchCompanies')
      await connectionStore.fetchConnections()
      console.log('Finalizou fetchConnections')
      connections.value = connectionStore.connections
      await fetchCompanyConnections()
      console.log('Finalizou fetchCompanyConnections')
    } catch (error) {
      console.error('Erro ao carregar conexões:', error)
      toast.error('Erro ao carregar conexões')
    } finally {
      isLoading.value = false
      console.log('isLoading definido como false')
    }
  }

  // Connection operations
  const createConnection = async (connectionData) => {
    try {
      // Log da URL e dos dados enviados
      console.log('URL do POST (criação):', webhooks.connections.create)
      console.log('Dados enviados para criação:', {
        name: connectionData.name,
        company_id: connectionData.company_id
      })

      // 1. Criar conexão na Evolution API
      const evolutionResponse = await api.post(webhooks.connections.create, {
        name: connectionData.name,
        company_id: connectionData.company_id
      })

      console.log('Resposta da Evolution API:', evolutionResponse.data);

      // Corrigir para tratar array ou objeto
      const responseData = Array.isArray(evolutionResponse.data) ? evolutionResponse.data[0] : evolutionResponse.data;
      console.log('Objeto analisado:', responseData);
      console.log('ID retornado:', responseData.id);
      console.log('connection_id retornado:', responseData.connection_id);
      console.log('connectionId retornado:', responseData.connectionId);

      const connectionId = responseData.id || responseData.connection_id || responseData.connectionId;
      if (!connectionId) {
        console.warn('Nenhum campo de ID encontrado na resposta:', responseData);
        throw new Error('ID da conexão não retornado pela Evolution API');
      }

      // 2. Relacionar conexão à empresa no banco local
      console.log('URL do POST (vincular):', webhooks.companiesConnections.create)
      console.log('Dados enviados para vincular:', {
        company_id: connectionData.company_id,
        connection_id: connectionId
      })
      // await api.post(webhooks.companiesConnections.create, {
      //   company_id: connectionData.company_id,
      //   connection_id: connectionId
      // })

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
      await api.post(webhooks.companiesConnections.update, {
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