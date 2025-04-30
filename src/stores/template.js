import { defineStore } from 'pinia'
import { webhooks } from '../config/webhooks'

export const useTemplateStore = defineStore('template', {
  state: () => ({
    templates: [],
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchTemplates() {
      try {
        this.isLoading = true
        const response = await fetch(webhooks.templates.list)
        const data = await response.json()
        this.templates = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async createTemplate(template) {
      try {
        this.isLoading = true
        this.error = null
        
        // Preparar os dados para envio
        const payload = {
          template_name: template.name,
          template_message: template.message || '',
          template_connection: template.connection.name,
          template_list_id: template.validationListId,
          template_list_name: template.validationList?.name,
          validationList: template.validationList, // Adicionar o objeto completo
          customFields: template.customFields || [],
          integration_type: template.connection.integration || template.integration_type || null
        }
        
        // Adicionar informações do template de negócio se for uma conexão business
        if (template.connection.integration === 'WHATSAPP-BUSINESS' && template.businessTemplate) {
          // Enviar o ID do template de negócio
          payload.businessTemplate = typeof template.businessTemplate === 'object' 
            ? template.businessTemplate.id 
            : template.businessTemplate
                
          // Enviar o nome do template de negócio
          if (typeof template.businessTemplate === 'object') {
            payload.business_template_name = template.businessTemplate.name || 'Template de Negócio WhatsApp'
                
            // Incluir também idioma e categoria se disponíveis
            if (template.businessTemplate.language) {
              payload.business_template_language = template.businessTemplate.language;
            }
                
            if (template.businessTemplate.category) {
              payload.business_template_category = template.businessTemplate.category;
            }
          }
        } else if (template.connection.integration === 'WHATSAPP-BAILEYS') {
          // Adicionar o JID da conexão para conexões Baileys
          if (template.connection.ownerJid) {
            payload.connection_jid = template.connection.ownerJid;
          }
        }
        
        const response = await fetch(webhooks.templates.create, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Erro ao criar template')
        }
        
        // Atualizar a lista de templates após a criação
        await this.fetchTemplates()
        
        return await response.json()
      } catch (error) {
        console.error('Erro ao criar template:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateTemplate(template) {
      try {
        this.isLoading = true
        const response = await fetch(webhooks.templates.update, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(template)
        })
        const data = await response.json()
        const index = this.templates.findIndex(t => t.id === template.id)
        if (index !== -1) {
          this.templates[index] = data
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async validateTemplate(template) {
      try {
        this.isLoading = true
        const response = await fetch(webhooks.validation.validate, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(template)
        })
        return await response.json()
      } catch (error) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    // Função para executar o template
    async executeTemplate(template) {
      try {
        this.isLoading = true
        
        console.log('=== INICIANDO EXECUÇÃO DO TEMPLATE ===');
        console.log('Template completo:', JSON.stringify(template, null, 2));
        
        // Função auxiliar para selecionar mensagem aleatória
        const getRandomMessage = (messages) => {
          return messages[Math.floor(Math.random() * messages.length)];
        };
    
        // Extrair os JIDs da lista de validação
        const jids = template.validationList.leads.map(lead => ({
          jid: lead.jid,
          message: getRandomMessage(template.aiResponses)
        }));
        
        console.log('JIDs extraídos:', jids);
        
        // Preparar os dados para envio
        const payload = {
          template_id: template.id,
          template_name: template.template_name,
          template_connection: template.template_connection,
          template_list_id: template.template_list_id,
          template_list_name: template.template_list_name,
          leadsMessages: jids
        }
        
        console.log('Payload inicial:', payload);
        
        // Verificar se é uma conexão business
        let isBusinessConnection = false;
        
        if (template.template_connection && typeof template.template_connection === 'object') {
          console.log('Tipo de conexão (objeto):', template.template_connection.integration);
          isBusinessConnection = template.template_connection.integration === 'WHATSAPP-BUSINESS';
        } else if (typeof template.template_connection === 'string') {
          console.log('Tipo de conexão (string):', template.integration_type);
          isBusinessConnection = template.integration_type === 'WHATSAPP-BUSINESS';
        } 
        
        // Verificar também se há campos de template business no objeto
        if (!isBusinessConnection && (template.business_template_id || template.business_template_name)) {
          console.log('Detectado template business pelos campos business_template_id/name');
          isBusinessConnection = true;
        }
        
        console.log('É conexão business?', isBusinessConnection);
        
        if (isBusinessConnection) {
          console.log('Executando template business');
          console.log('businessTemplate:', template.businessTemplate);
          
          // Adicionar o nome do template business
          if (template.businessTemplate) {
            if (typeof template.businessTemplate === 'object') {
              console.log('businessTemplate é um objeto com propriedades:', Object.keys(template.businessTemplate));
              
              if (template.businessTemplate.name) {
                console.log('Usando nome do objeto businessTemplate:', template.businessTemplate.name);
                payload.business_template_name = template.businessTemplate.name;
              } else {
                console.log('Objeto businessTemplate não tem propriedade name');
              }
            } else if (template.business_template_name) {
              console.log('Usando business_template_name existente:', template.business_template_name);
              payload.business_template_name = template.business_template_name;
            } else if (typeof template.businessTemplate === 'string') {
              console.log('businessTemplate é uma string (ID):', template.businessTemplate);
              // Forçar o nome "hello_world" para templates business
              payload.business_template_name = "hello_world";
              console.log('Definindo business_template_name como "hello_world"');
            } else {
              console.log('Tipo de businessTemplate desconhecido:', typeof template.businessTemplate);
              payload.business_template_name = "hello_world";
            }
          } else {
            console.log('Template business sem businessTemplate definido');
            payload.business_template_name = "hello_world";
          }
          
          // Adicionar o ID do template business
          if (typeof template.businessTemplate === 'object' && template.businessTemplate.id) {
            payload.businessTemplate = template.businessTemplate.id;
            console.log('Adicionando ID do template business:', payload.businessTemplate);
          } else if (typeof template.businessTemplate === 'string') {
            payload.businessTemplate = template.businessTemplate;
            console.log('Adicionando ID do template business (string):', payload.businessTemplate);
          }
        }
        
        console.log('Payload final para envio:', JSON.stringify(payload, null, 2));
        
        // Enviar para a API
        console.log('Enviando para:', webhooks.templates.execute);
        const response = await fetch(webhooks.templates.execute, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        
        console.log('Status da resposta:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Erro na resposta:', errorData);
          throw new Error(errorData.message || 'Erro ao executar o template')
        }
        
        const responseData = await response.json();
        console.log('Resposta da API:', responseData);
        return responseData;
      } catch (error) {
        console.error('Erro ao executar template:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
        console.log('=== FIM DA EXECUÇÃO DO TEMPLATE ===');
      }
    },

    async deleteTemplate(templateId) {
      try {
        this.isLoading = true
        const response = await fetch(webhooks.templates.delete, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: templateId })
        })

        if (!response.ok) {
          throw new Error('Erro ao excluir template')
        }

        // Atualiza a lista local removendo o template excluído
        this.templates = this.templates.filter(template => template.id !== templateId)
        
        // Força uma nova busca dos templates para garantir sincronização
        await this.fetchTemplates()
        
        return true
      } catch (error) {
        console.error('Erro ao excluir template:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    }
  }
})