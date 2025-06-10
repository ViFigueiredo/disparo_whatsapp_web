import { defineStore } from 'pinia'
import axios from 'axios'
import { webhooks } from '../config/webhooks'

const formatCNPJ = (cnpj) => {
    if (!cnpj) return ''
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export const useCompaniesStore = defineStore('companies', {
    state: () => ({
        companies: [],
        loading: false,
        error: null,
        lastOperation: null,
        currentRequestId: 0
    }),

    getters: {
        formattedCompanies: (state) => {
            if (!Array.isArray(state.companies)) {
                return []
            }
            return state.companies.map(company => ({
                ...company,
                formatted_cnpj: formatCNPJ(company.cnpj)
            }))
        }
    },

    actions: {
        async fetchCompanies() {
            if (this.loading) return

            const requestId = ++this.currentRequestId
            this.loading = true
            this.error = null

            try {
                const response = await axios.get(webhooks.companies.list)

                if (requestId !== this.currentRequestId) {
                    return
                }

                if (Array.isArray(response.data)) {
                    this.companies = response.data
                } else if (Array.isArray(response.data.data)) {
                    this.companies = response.data.data
                } else if (Array.isArray(response.data.result)) {
                    this.companies = response.data.result
                } else {
                    this.companies = []
                }
            } catch (error) {
                if (requestId === this.currentRequestId) {
                    console.error('Erro ao carregar empresas:', error)
                    this.error = 'Erro ao carregar empresas'
                    this.companies = []
                }
                throw error
            } finally {
                if (requestId === this.currentRequestId) {
                    this.loading = false
                }
            }
        },

        async createCompany(company) {
            if (this.loading) return

            const requestId = ++this.currentRequestId
            this.loading = true
            this.error = null
            this.lastOperation = 'create'

            try {
                const companyData = {
                    name: company.name,
                    cnpj: (company.cnpj || '').replace(/[^\d]/g, ''),
                    email: company.email,
                    phone: (company.phone || '').replace(/[^\d]/g, ''),
                    status: company.status || 'active'
                }

                const response = await axios.post(webhooks.companies.create, companyData)

                if (requestId === this.currentRequestId) {
                    await this.fetchCompanies()
                }
                return response.data
            } catch (error) {
                if (requestId === this.currentRequestId) {
                    console.error('Erro ao criar empresa:', error)
                    this.error = 'Erro ao criar empresa'
                }
                throw error
            } finally {
                if (requestId === this.currentRequestId) {
                    this.loading = false
                    this.lastOperation = null
                }
            }
        },

        async updateCompany(company) {
            if (this.loading) return
            if (!company.id) throw new Error('ID da empresa é obrigatório para atualização')

            const requestId = ++this.currentRequestId
            this.loading = true
            this.error = null
            this.lastOperation = 'update'

            try {
                const companyData = {
                    id: company.id,
                    name: company.name,
                    cnpj: (company.cnpj || '').replace(/[^\d]/g, ''),
                    email: company.email,
                    phone: (company.phone || '').replace(/[^\d]/g, ''),
                    status: company.status || 'active'
                }

                const response = await axios.post(webhooks.companies.update, companyData)

                if (requestId === this.currentRequestId) {
                    await this.fetchCompanies()
                }
                return response.data
            } catch (error) {
                if (requestId === this.currentRequestId) {
                    console.error('Erro ao atualizar empresa:', error)
                    this.error = 'Erro ao atualizar empresa'
                }
                throw error
            } finally {
                if (requestId === this.currentRequestId) {
                    this.loading = false
                    this.lastOperation = null
                }
            }
        },

        async deleteCompany(companyId) {
            if (this.loading) return

            const requestId = ++this.currentRequestId
            this.loading = true
            this.error = null
            this.lastOperation = 'delete'

            try {
                await axios.post(webhooks.companies.delete, { id: companyId })
                if (requestId === this.currentRequestId) {
                    await this.fetchCompanies()
                }
            } catch (error) {
                if (requestId === this.currentRequestId) {
                    console.error('Erro ao excluir empresa:', error)
                    this.error = 'Erro ao excluir empresa'
                }
                throw error
            } finally {
                if (requestId === this.currentRequestId) {
                    this.loading = false
                    this.lastOperation = null
                }
            }
        }
    }
}) 