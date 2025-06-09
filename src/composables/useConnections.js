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

  // Computed para mapear conexões com empresas
  const connectionsWithCompanies = computed(() => {
    console.log('=== DEBUG connectionsWithCompanies Computed ===')
    console.log('Current Connections (from store):', JSON.stringify(connections.value, null, 2))
    console.log('Current Company Connections (from API):', JSON.stringify(companyConnections.value, null, 2))
    console.log('Current Companies (from store):', JSON.stringify(companiesStore.companies, null, 2))

    const mappedConnections = connections.value.map(connection => {
      console.log('-- Mapping Connection:', connection.id, connection.name)

      const connectionLink = companyConnections.value.find(
        link => {
          const match = String(link.connection_id) === String(connection.id)
          console.log('  Comparing link.connection_id (', link.connection_id, ') with connection.id (', connection.id, '):', match)
          return match
        }
      )
      
      let companyName = 'N/A'
      if (connectionLink) {
        console.log('  Found connectionLink:', JSON.stringify(connectionLink, null, 2))
        const company = companiesStore.companies.find(
          c => {
            const match = String(c.id) === String(connectionLink.company_id)
            console.log('    Comparing company.id (', c.id, ') with link.company_id (', connectionLink.company_id, '):', match)
            return match
          }
        )
        if (company) {
          companyName = company.name
          console.log('    Found company:', JSON.stringify(company, null, 2))
        } else {
          console.log('    Company not found for link.company_id:', connectionLink.company_id)
        }
      } else {
        console.log('  No connectionLink found for connection.id:', connection.id)
      }

      const updatedConnection = {
        ...connection,
        companyName: companyName
      }
      console.log('-- Mapped Connection Result:', JSON.stringify(updatedConnection, null, 2))
      return updatedConnection
    })
    
    console.log('Final Mapped Connections Array:', JSON.stringify(mappedConnections, null, 2))
    console.log('=== END DEBUG connectionsWithCompanies Computed ===')
    return mappedConnections
  })

  // Fetch functions
  const fetchCompanyConnections = async () => {
    try {
      console.log('=== DEBUG fetchCompanyConnections ===')
      console.log('Fetching company connections...')
      const response = await api.get(webhooks.companiesConnections.list)
      console.log('Raw companiesConnections API response:', response.data) // Log específico para a resposta da API

      // Acessando o array dentro da propriedade companiesConnections
      const connections = response.data.companiesConnections || []
      console.log('Extracted connections (after API response):', JSON.stringify(connections, null, 2))
      
      companyConnections.value = Array.isArray(connections) ? connections : []
      
      console.log('Final companyConnections value (after update):', JSON.stringify(companyConnections.value, null, 2))
      console.log('=== END DEBUG fetchCompanyConnections ===')
      
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
      console.log('=== DEBUG fetchConnections ===')
      await companiesStore.fetchCompanies()
      await connectionStore.fetchConnections()
      await fetchCompanyConnections()

      console.log('Final connectionsWithCompanies (after mapping):', JSON.stringify(connectionsWithCompanies.value, null, 2))
      console.log('=== END DEBUG fetchConnections ===')

      // Mostrar aviso apenas para administradores
      if (
        authStore.isAdmin &&
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
      console.log('=== DEBUG createConnection ===')
      // Se não for admin, usar a empresa do usuário logado
      if (!authStore.isAdmin) {
        connectionData.company_id = authStore.user.company_id
      }

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
      await fetchConnections() // Recarrega todas as conexões e vinculações após a criação
      console.log('=== END DEBUG createConnection ===')
      return true
    } catch (error) {
      console.error('Erro ao criar conexão:', error)
      toast.error('Erro ao criar conexão: ' + (error.message || 'Erro desconhecido'))
      return false
    }
  }

  const updateConnectionCompany = async (connectionData) => {
    try {
      console.log('=== DEBUG updateConnectionCompany ===')
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
      console.log('=== END DEBUG updateConnectionCompany ===')
      return true
    } catch (error) {
      console.error('Erro ao atualizar empresa da conexão:', error)
      toast.error('Erro ao atualizar empresa da conexão: ' + (error.message || 'Erro desconhecido'))
      return false
    }
  }

  const getCompanyNameForConnection = (connection) => {
    if (!connection) return 'N/A'
    
    // Agora connectionsWithCompanies já deve ter o companyName
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