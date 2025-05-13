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

            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('O servidor retornou um formato inválido. Esperado: JSON')
            }

            if (!response.ok) {
                throw new Error(`Erro ao carregar listas: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            const lists = data[1]?.lists || []
            validationLists.value = lists
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
            const response = await fetch(webhooks.validation.validate, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ leads })
            })

            if (!response.ok) {
                throw new Error('Erro ao validar números')
            }

            const data = await response.json()
            const validatedLeads = data
                .map(result => {
                    if (result.success && result.data && result.data.length > 0) {
                        const validationData = result.data[0]
                        return {
                            nome: leads.find(l => l.numero === validationData.number)?.nome || '',
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
            toast.error('Erro ao validar números')
            return []
        } finally {
            isLoading.value = false
        }
    }

    const saveValidationList = async (listData) => {
        try {
            isLoading.value = true
            const response = await fetch(webhooks.validation.save, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(listData)
            })

            if (!response.ok) {
                throw new Error('Erro ao salvar lista')
            }

            await fetchValidationLists()
            toast.success('Lista salva com sucesso!')
            return true
        } catch (error) {
            console.error('Erro ao salvar lista:', error)
            toast.error('Erro ao salvar lista')
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