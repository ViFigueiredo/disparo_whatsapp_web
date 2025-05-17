import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { webhooks } from '../config/webhooks'

export function useLeads() {
    const toast = useToast()
    const isLoading = ref(false)
    const validationLists = ref([])

    const fetchValidationLists = async () => {
        try {
            isLoading.value = true
            const response = await fetch(webhooks.validation.list)

            if (!response.ok) {
                throw new Error(`Erro ao carregar listas: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            console.log('Dados brutos recebidos:', data)

            // Validar se os dados são um array e têm o formato esperado
            if (!Array.isArray(data) || data.length < 2) {
                console.warn('Formato inválido ou dados vazios')
                validationLists.value = []
                return
            }

            // Processar os leads e listas
            const leads = data[0]?.leads || []
            const listsData = data[1]?.lists || []

            console.log('Leads recebidos:', leads)
            console.log('Listas recebidas:', listsData)

            if (!Array.isArray(listsData)) {
                console.warn('Formato de listas inválido')
                validationLists.value = []
                return
            }

            // Mapear as listas com os dados necessários
            validationLists.value = listsData.map(list => {
                // Encontrar os leads desta lista
                const listLeads = leads.filter(lead => lead.list_id === parseInt(list.id))
                
                return {
                    id: list.id,
                    name: list.name,
                    company_id: list.company_id,
                    total_leads: listLeads.length,
                    valid_leads: listLeads.filter(lead => lead.exists).length,
                    invalid_leads: listLeads.filter(lead => !lead.exists).length,
                    created_at: list.created_at || new Date().toISOString()
                }
            })

            console.log('Listas processadas:', validationLists.value)
        } catch (error) {
            console.error('Erro ao carregar listas:', error)
            toast.error(`Erro ao carregar listas: ${error.message}`)
            validationLists.value = []
        } finally {
            isLoading.value = false
        }
    }

    const validateLeads = async (leads) => {
        try {
            isLoading.value = true
            
            // Validar se há leads para validar
            if (!leads || !Array.isArray(leads) || leads.length === 0) {
                console.warn('Nenhum lead para validar')
                toast.warning('Nenhum lead para validar')
                return []
            }

            // Formatar os leads para envio
            const formattedLeads = leads.map(lead => {
                if (!lead.numero || !lead.nome) {
                    console.warn('Lead inválido:', lead)
                    return null
                }
                return {
                    number: lead.numero.replace(/[^\d]/g, ''),
                    name: lead.nome.trim()
                }
            }).filter(Boolean)

            if (formattedLeads.length === 0) {
                console.warn('Nenhum lead válido após formatação')
                toast.warning('Nenhum lead válido para validar')
                return []
            }

            console.log('Enviando leads para validação:', formattedLeads)

            const payload = {
                leads: formattedLeads
            }

            console.log('Payload da requisição:', payload)

            const response = await fetch(webhooks.validation.validate, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                console.error('Erro na resposta do servidor:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: errorData
                })
                throw new Error(errorData?.message || `Erro ao validar números: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            console.log('Resposta da validação:', data)

            // Validar o formato da resposta
            if (!Array.isArray(data)) {
                console.error('Formato de resposta inválido:', data)
                throw new Error('Formato de resposta inválido do servidor')
            }

            const validatedLeads = data
                .map(result => {
                    if (result.success && result.data && result.data.length > 0) {
                        const validationData = result.data[0]
                        const originalLead = leads.find(l => l.numero === validationData.number)
                        return {
                            nome: originalLead?.nome || '',
                            numero: validationData.number,
                            exists: validationData.exists,
                            jid: validationData.jid
                        }
                    }
                    return null
                })
                .filter(lead => lead !== null)

            const totalValid = validatedLeads.filter(lead => lead.exists).length
            toast.success(`Validação concluída: ${totalValid} de ${validatedLeads.length} números são válidos`)

            return validatedLeads
        } catch (error) {
            console.error('Erro na validação:', error)
            toast.error(error.message || 'Erro ao validar números')
            return []
        } finally {
            isLoading.value = false
        }
    }

    const saveValidationList = async (listData) => {
        try {
            isLoading.value = true

            // Validar dados antes de enviar
            if (!listData || !listData.name || !Array.isArray(listData.leads)) {
                console.error('Dados inválidos para salvar:', listData)
                throw new Error('Dados inválidos para salvar a lista')
            }

            // Formatar dados para envio
            const payload = {
                name: listData.name,
                leads: listData.leads.map(lead => ({
                    nome: lead.nome,
                    numero: lead.numero,
                    exists: lead.exists,
                    jid: lead.jid
                })),
                total_leads: listData.leads.length,
                valid_leads: listData.leads.filter(lead => lead.exists).length,
                invalid_leads: listData.leads.filter(lead => !lead.exists).length,
                company_id: listData.companyId || undefined
            }

            console.log('Payload completo:', payload)
            console.log('Company ID:', payload.company_id)

            const response = await fetch(webhooks.validation.save, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                console.error('Erro na resposta do servidor:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: errorData
                })
                throw new Error(errorData?.message || `Erro ao salvar lista: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            console.log('Resposta do servidor:', data)

            await fetchValidationLists()
            toast.success('Lista salva com sucesso!')
            return true
        } catch (error) {
            console.error('Erro ao salvar lista:', error)
            toast.error(error.message || 'Erro ao salvar lista')
            return false
        } finally {
            isLoading.value = false
        }
    }

    const downloadValidatedCSV = async (listId) => {
        try {
            isLoading.value = true
            const response = await fetch(webhooks.validation.list)
            const data = await response.json()

            const allLeads = data[0]?.leads || []
            const listLeads = allLeads.filter(lead => lead.list_id === listId)

            if (listLeads.length === 0) {
                toast.warning('Nenhum lead encontrado para esta lista')
                return
            }

            const BOM = '\uFEFF'
            const csvContent = BOM + [
                ['nome', 'numero', 'status'].join(','),
                ...listLeads.map(lead => [
                    lead.nome.split(';')[0],
                    lead.numero.replace(/^e/, ''),
                    lead.exists ? 'Válido' : 'Inválido'
                ].join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `lista_validada_${listId}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast.success('Download iniciado com sucesso!')
        } catch (error) {
            console.error('Erro ao gerar CSV:', error)
            toast.error('Erro ao gerar arquivo CSV')
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        validationLists,
        fetchValidationLists,
        validateLeads,
        saveValidationList,
        downloadValidatedCSV
    }
} 