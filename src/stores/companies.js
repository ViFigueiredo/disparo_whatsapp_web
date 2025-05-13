import { defineStore } from 'pinia'
import axios from 'axios'

const WEBHOOK_COMPANIES_LIST = import.meta.env.VITE_WEBHOOK_COMPANIES_LIST
const WEBHOOK_COMPANIES_CREATE = import.meta.env.VITE_WEBHOOK_COMPANIES_CREATE
const WEBHOOK_COMPANIES_UPDATE = import.meta.env.VITE_WEBHOOK_COMPANIES_UPDATE
const WEBHOOK_COMPANIES_DELETE = import.meta.env.VITE_WEBHOOK_COMPANIES_DELETE

const formatCNPJ = (cnpj) => {
    if (!cnpj) return ''
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export const useCompaniesStore = defineStore('companies', {
    state: () => ({
        companies: [],
        loading: false,
        error: null
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
            this.loading = true
            this.error = null
            try {
                console.log('Fetching companies from:', WEBHOOK_COMPANIES_LIST)
                const response = await axios.get(WEBHOOK_COMPANIES_LIST)
                console.log('Raw response.data:', response.data)
                // Aceita array direto ou dentro de uma propriedade
                if (Array.isArray(response.data)) {
                    this.companies = response.data
                } else if (Array.isArray(response.data.data)) {
                    this.companies = response.data.data
                } else if (Array.isArray(response.data.result)) {
                    this.companies = response.data.result
                } else {
                    this.companies = []
                }
                console.log('Companies loaded:', this.companies)
            } catch (error) {
                console.error('Erro ao carregar empresas:', error)
                this.error = 'Erro ao carregar empresas'
                this.companies = []
                throw error
            } finally {
                this.loading = false
            }
        },

        async createCompany(company) {
            this.loading = true
            this.error = null
            try {
                // Removendo formatação do CNPJ antes de enviar
                const companyData = {
                    ...company,
                    cnpj: company.cnpj.replace(/[^\d]/g, '')
                }
                console.log('Creating company using webhook:', WEBHOOK_COMPANIES_CREATE)
                console.log('Company data:', companyData)
                const response = await axios.post(WEBHOOK_COMPANIES_CREATE, companyData)
                if (response.data) {
                    this.companies.push(response.data)
                }
                return response.data
            } catch (error) {
                console.error('Erro ao criar empresa:', error)
                this.error = 'Erro ao criar empresa'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateCompany(company) {
            this.loading = true
            this.error = null
            try {
                // Removendo formatação do CNPJ antes de enviar
                const companyData = {
                    ...company,
                    id: company.id,
                    cnpj: company.cnpj.replace(/[^\d]/g, '')
                }
                console.log('Updating company using webhook:', WEBHOOK_COMPANIES_UPDATE)
                const response = await axios.post(WEBHOOK_COMPANIES_UPDATE, companyData)
                if (response.data) {
                    const index = this.companies.findIndex(c => c.id === company.id)
                    if (index !== -1) {
                        this.companies[index] = response.data
                    }
                }
                return response.data
            } catch (error) {
                console.error('Erro ao atualizar empresa:', error)
                this.error = 'Erro ao atualizar empresa'
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteCompany(companyId) {
            this.loading = true
            this.error = null
            try {
                console.log('Deleting company using webhook:', WEBHOOK_COMPANIES_DELETE)
                await axios.post(WEBHOOK_COMPANIES_DELETE, { id: companyId })
                this.companies = this.companies.filter(c => c.id !== companyId)
            } catch (error) {
                console.error('Erro ao excluir empresa:', error)
                this.error = 'Erro ao excluir empresa'
                throw error
            } finally {
                this.loading = false
            }
        }
    }
}) 