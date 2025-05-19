import { computed, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useValidationStore } from '../stores/validation'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'

export function useLeads() {
    const toast = useToast()
    const validationStore = useValidationStore()
    const localLoading = ref(false)

    const validationLists = computed(() => validationStore.lists)
    const leads = computed(() => validationStore.leads)
    const isLoading = computed(() => validationStore.isLoading || localLoading.value)
    const error = computed(() => validationStore.error)

    const fetchValidationLists = async () => {
        try {
            await validationStore.fetchLists()
        } catch (error) {
            toast.error('Erro ao carregar listas de validação')
            throw error
        }
    }

    const validateLeads = async (leads) => {
        try {
            localLoading.value = true
            const response = await api.post(webhooks.validation.validate, { leads })

            // Verificar se a resposta é um array
            if (!Array.isArray(response.data)) {
                throw new Error('Formato de resposta inválido')
            }

            // Processar cada item do array de resposta
            const validatedLeads = response.data.map((item, index) => {
                if (!item.success || !Array.isArray(item.data) || item.data.length === 0) {
                    return {
                        ...leads[index],
                        exists: false,
                        jid: null
                    }
                }

                const validationResult = item.data[0]
                return {
                    ...leads[index],
                    exists: validationResult.exists,
                    jid: validationResult.jid
                }
            })

            return validatedLeads
        } catch (error) {
            console.error('Erro na validação:', error)
            toast.error(error.message || 'Erro ao validar números')
            return []
        } finally {
            localLoading.value = false
        }
    }

    const saveValidationList = async (listData) => {
        try {
            localLoading.value = true

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
                throw new Error('Erro ao salvar lista')
            }

            await fetchValidationLists()
            toast.success('Lista salva com sucesso!')
            return true
        } catch (error) {
            console.error('Erro ao salvar lista:', error)
            toast.error('Erro ao salvar lista: ' + (error.message || 'Erro desconhecido'))
            return false
        } finally {
            localLoading.value = false
        }
    }

    const deleteValidationList = async (listId) => {
        try {
            localLoading.value = true
            const response = await fetch(webhooks.validation.delete, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: listId })
            })

            if (!response.ok) {
                throw new Error('Erro ao excluir lista')
            }

            await fetchValidationLists()
            toast.success('Lista excluída com sucesso!')
            return true
        } catch (error) {
            console.error('Erro ao excluir lista:', error)
            toast.error('Erro ao excluir lista: ' + (error.message || 'Erro desconhecido'))
            return false
        } finally {
            localLoading.value = false
        }
    }

    const downloadValidatedCSV = (leads) => {
        try {
            // Criar cabeçalho
            const headers = ['Nome', 'Número', 'Status']
            const csvContent = [
                headers.join(','),
                ...leads.map(lead => [
                    `"${lead.nome}"`,
                    `"${lead.numero}"`,
                    lead.exists ? 'Válido' : 'Inválido'
                ].join(','))
            ].join('\n')

            // Criar blob e link para download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', 'leads_validados.csv')
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Erro ao gerar CSV:', error)
            toast.error('Erro ao gerar arquivo CSV')
        }
    }

    return {
        validationLists,
        leads,
        isLoading,
        error,
        fetchValidationLists,
        validateLeads,
        saveValidationList,
        deleteValidationList,
        downloadValidatedCSV
    }
} 