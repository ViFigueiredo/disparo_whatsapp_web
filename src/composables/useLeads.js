import { computed, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useValidationStore } from '../stores/leads'
import { webhooks } from '../config/webhooks'
import api from '../config/axios'

export function useLeads() {
    const toast = useToast()
    const validationStore = useValidationStore()
    const localLoading = ref(false)

    const validationLists = computed(() => validationStore.formattedLists)
    const leads = computed(() => validationStore.formattedLeads)
    const isLoading = computed(() => validationStore.isLoading || localLoading.value)
    const error = computed(() => validationStore.error)
    const lastOperation = computed(() => validationStore.lastOperation)

    const handleError = (error, message) => {
        console.error(message, error)
        toast.error(message + (error.message ? `: ${error.message}` : ''))
        return false
    }

    const fetchValidationLists = async () => {
        try {
            await validationStore.fetchLists()
            return true
        } catch (error) {
            return handleError(error, 'Erro ao carregar listas de validação')
        }
    }

    const validateLeads = async (leads) => {
        try {
            localLoading.value = true
            const response = await api.post(webhooks.validation.validate, { leads })

            if (!Array.isArray(response.data)) {
                throw new Error('Formato de resposta inválido')
            }

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
            return handleError(error, 'Erro ao validar números')
        } finally {
            localLoading.value = false
        }
    }

    const saveValidationList = async (listData) => {
        try {
            localLoading.value = true

            if (!validationStore.validateListData(listData)) {
                throw new Error('Dados inválidos para salvar a lista')
            }

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
                company_id: listData.company_id || undefined
            }

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
            return handleError(error, 'Erro ao salvar lista')
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
            return handleError(error, 'Erro ao excluir lista')
        } finally {
            localLoading.value = false
        }
    }

    const downloadValidatedCSV = (leads) => {
        try {
            const headers = ['Nome', 'Número', 'Status']
            const csvContent = [
                headers.join(','),
                ...leads.map(lead => [
                    `"${lead.nome}"`,
                    `"${lead.numero}"`,
                    lead.exists ? 'Válido' : 'Inválido'
                ].join(','))
            ].join('\n')

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
            handleError(error, 'Erro ao gerar arquivo CSV')
        }
    }

    return {
        validationLists,
        leads,
        isLoading,
        error,
        lastOperation,
        fetchValidationLists,
        validateLeads,
        saveValidationList,
        deleteValidationList,
        downloadValidatedCSV
    }
} 